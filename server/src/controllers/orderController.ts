import { Request, Response } from "express";
import { Order } from "../models/Order";
import { PlatformAccount } from "../models/PlatformAccount";
import { Business } from "../models/Business";
import { Product } from "../models/Product";
import { Variant } from "../models/Variant";
import mongoose from "mongoose";

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
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      product,
      selectedItems,
      notes,
      platformAccountId
    } = req.body;

    // 1. Auth Guard Checklist Protection
    // Ensure you have an authentication middleware attaching the logged-in user profile to req.user
    const currentUserId = (req as any).user?._id; 
    if (!currentUserId) {
      res.status(401).json({ success: false, message: "Authentication required. You are not logged in." });
      return;
    }

    // 2. Incoming Payload Validations
    if (!product?._id || !product.businessId) {
      res.status(400).json({ success: false, message: "Invalid product or business tracking identifier metadata." });
      return;
    }

    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      res.status(400).json({ success: false, message: "Cannot process checkout: No targeted SKU configurations were provided." });
      return;
    }

    if (!platformAccountId) {
      res.status(400).json({ success: false, message: "Target collection platform payout routing account is required." });
      return;
    }

    // Extract raw business ID string safely whether populated object or straight ID string string
    const businessId = typeof product.businessId === "object" ? product.businessId._id : product.businessId;

    // 3. Financial Accumulation Engines
    let calculatedTotalPrice = 0;
    let totalQuantityCalculated = 0;

    // Accumulate total pieces coming across all variant configurations to evaluate wholesale matrix limits
    const cumulativePiecesCount = selectedItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);

    // Format individual variant blocks safely for Mongoose model instantiation rules
    const formattedOrderItems = selectedItems.map((item: any) => {
      // Use the variant price or fallback directly to product tracking baselines
      let baselinePrice = Number(item.price || product.measurement?.pricePerUnit || product.basePrice || 0);
      
      // Wholesale Rule: If cumulative total purchase across all styles meets or passes 500 units, apply 5% discount
      if (cumulativePiecesCount >= 500) {
        baselinePrice = baselinePrice * 0.95;
      }

      const itemQty = Number(item.quantity || 1);
      
      // Calculate costs metrics for this subset block loop layer
      calculatedTotalPrice += baselinePrice * itemQty;
      totalQuantityCalculated += itemQty;

      return {
        variantId: item.variantId ? new mongoose.Types.ObjectId(item.variantId) : undefined,
        sku: item.sku || product.sku || "",
        unitPrice: baselinePrice,
        quantity: itemQty
      };
    });

    // 4. Split Payment / Escrow Broker Computations (e.g., 5% Marketplace Platform Commission fee rule)
    const commissionRate = 0.05; 
    const commissionAmount = calculatedTotalPrice * commissionRate;
    const vendorPayoutAmount = calculatedTotalPrice - commissionAmount;

    // 5. Construct and Save standard document transaction context
    const newOrder = new Order({
      productId: new mongoose.Types.ObjectId(product._id),
      items: formattedOrderItems,
      businessId: new mongoose.Types.ObjectId(businessId),
      ownerId: new mongoose.Types.ObjectId(currentUserId),
      platformAccountId: new mongoose.Types.ObjectId(platformAccountId),
      totalQuantity: totalQuantityCalculated,
      totalPrice: calculatedTotalPrice,
      commission: commissionAmount,
      vendorAmount: vendorPayoutAmount,
      notes: notes || "",
      customerStatus: "pending_payment",
      internalStatus: "pending_payment",
      paymentMethod: "bank_transfer"
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Multi-SKU transaction matrix generated successfully.",
      data: savedOrder
    });

  } catch (error: any) {
    console.error("Order Engine Exception Handler:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Processing Failure within order engine mapping parameters.",
      error: error.message
    });
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