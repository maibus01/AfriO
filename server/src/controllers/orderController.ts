import { Request, Response } from "express";
import { Order } from "../models/Order";
import { PlatformAccount } from "../models/PlatformAccount";
import { Business } from "../models/Business";
import { Product } from "../models/Product";
import { Variant } from "../models/Variant";

// ==============================
// HELPER → GET SELLER BUSINESSES
// ==============================
const getUserBusinessIds = async (userId: string) => {
  const businesses = await Business.find({ ownerId: userId });
  return businesses.map((b) => b._id);
};

// ==============================
// CREATE ORDER (CUSTOMER)
// ==============================
export const createOrder = async (req: any, res: Response) => {
  try {
    const {
      productId,
      businessId,
      quantity,
      notes,
      platformAccountId,
      variantId, // 👈 MAIN INPUT
    } = req.body;

    // =========================
    // VALIDATE PAYMENT ACCOUNT
    // =========================
    const account = await PlatformAccount.findById(platformAccountId);

    if (!account || !account.isActive) {
      return res.status(400).json({
        message: "Invalid payment account",
      });
    }

    // =========================
    // VALIDATE PRODUCT
    // =========================
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let unitPrice = product.basePrice || 0;
    let variant = null;

    // =========================
    // VARIANT MODE (YOUR REQUIREMENT)
    // =========================
    if (variantId) {
      variant = await Variant.findById(variantId);

      if (!variant || !variant.isActive) {
        return res.status(404).json({
          message: "Variant not found",
        });
      }

      if (variant.stock < quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }

      unitPrice = variant.price;
    }

    const totalPrice = unitPrice * quantity;

    // =========================
    // CREATE ORDER (NOW WITH FULL VARIANT DATA)
    // =========================
    const order = await Order.create({
      productId,
      businessId,
      ownerId: req.user.id,

      quantity,
      notes,

      totalPrice,
      platformAccountId,

      // 🔥 VARIANT SNAPSHOT (WHAT YOU WANTED)
      variantId: variant?._id,
      sku: variant?.sku,
      unitPrice: unitPrice,

      customerStatus: "pending_payment",
      internalStatus: "pending_payment",
    });

    // =========================
    // STOCK REDUCTION
    // =========================
    if (variant) {
      await Variant.findByIdAndUpdate(variant._id, {
        $inc: { stock: -quantity },
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
      });
    }

    return res.status(201).json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ==============================
// GET ALL ORDERS (ADMIN)
// ==============================
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("productId")
      .populate("businessId")
      .populate("ownerId")
      .populate("platformAccountId")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ==============================
// GET CUSTOMER ORDERS
// ==============================
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ ownerId: req.user.id })
      .populate("productId")
      .populate("businessId")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};

// ==============================
// GET SELLER ORDERS
// ==============================
export const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({
      businessId: { $in: await getUserBusinessIds(req.user.id) },
    })
      .populate("productId")
      .populate("ownerId")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("SELLER ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

//
// ==============================
// ADMIN ACTIONS
// ==============================
//

// ✅ ADMIN → MARK PAYMENT RECEIVED
export const markPaymentReceived = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.internalStatus = "payment_received";
    order.customerStatus = "processing";

    await order.save();

    res.json({
      success: true,
      message: "Payment confirmed",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order" });
  }
};

// ✅ ADMIN → MARK DELIVERED (FINAL)
export const markDelivered = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.internalStatus = "delivered";
    order.customerStatus = "completed";

    await order.save();

    res.json({
      success: true,
      message: "Order completed",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete order" });
  }
};

export const searchOrderByRef = async (req: Request, res: Response) => {
  try {
    const ref = typeof req.query.ref === "string" ? req.query.ref : undefined;

    if (!ref) {
      return res.status(400).json({ message: "Invalid ref number" });
    }

    const order = await Order.findOne({ refNumber: ref });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};

//
// ==============================
// SELLER ACTIONS
// ==============================
//

// ✅ SELLER → START PROCESSING
export const sellerStartProcessing = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.internalStatus !== "payment_received") {
      return res.status(400).json({
        message: "Payment not confirmed yet",
      });
    }

    order.internalStatus = "processing";
    await order.save();

    res.json({
      success: true,
      message: "Order processing started",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order" });
  }
};

// ✅ SELLER → READY FOR PICKUP (AFRIO LOGISTICS)
export const sellerReadyForPickup = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.internalStatus = "ready_for_pickup";

    await order.save();

    res.json({
      success: true,
      message: "Ready for pickup",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order" });
  }
};


// ✅ SELLER → MARK UNAVAILABLE (ADMIN ONLY SEES)
export const sellerMarkUnavailable = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.internalStatus = "unavailable";

    await order.save();

    res.json({
      success: true,
      message: "Marked as unavailable",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order" });
  }
};