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


export const createOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const {
      product,
      selectedItems,
      notes,
      platformAccountId
    } = req.body;

    // 1. Auth Guard Protection
    const currentUserId = req.user?._id || req.user?.id; 
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

    const account = await PlatformAccount.findById(platformAccountId);
    if (!account || !account.isActive) {
      res.status(400).json({ success: false, message: "Target collection platform routing account is missing or inactive." });
      return;
    }

    const businessId = typeof product.businessId === "object" ? product.businessId._id : product.businessId;

    // 3. Financial & Snapshot Pre-Fetch Pipeline
    let calculatedTotalPrice = 0;
    let totalQuantityCalculated = 0;

    const cumulativePiecesCount = selectedItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);

    // Fetch the target variants directly from DB records to get the truth source for images & validation
    const variantIds = selectedItems.map((item: any) => item.variantId).filter(Boolean);
    const databaseVariants = await Variant.find({ _id: { $in: variantIds } });

    const formattedOrderItems = selectedItems.map((item: any) => {
      // Find the corresponding database document record for this specific style variant line
      const dbVariant = databaseVariants.find(v => v._id.toString() === item.variantId?.toString());

      // Evaluate prices based on database state if available, falling back to payload values next
      let baselinePrice = Number(dbVariant?.price || item.price || product.measurement?.pricePerUnit || product.basePrice || 0);
      
      // Wholesale Rule: Apply 5% discount if threshold matches 
      if (cumulativePiecesCount >= 500) {
        baselinePrice = baselinePrice * 0.95;
      }

      const itemQty = Number(item.quantity || 1);
      calculatedTotalPrice += baselinePrice * itemQty;
      totalQuantityCalculated += itemQty;

      // ⚡ BULLETPROOF SNAPSHOT IMAGE FALLBACK
      // 1. First priority: Check the direct DB variant record array image configuration field
      // 2. Second priority: Fall back to whatever variant array/string properties came from frontend cart payload
      // 3. Ultimate priority fallback: Default baseline product master parent image array configuration
      let snapshotImgString = "";
      
      if (dbVariant && dbVariant.images && dbVariant.images.length > 0) {
        snapshotImgString = dbVariant.images[0];
      } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        snapshotImgString = item.images[0];
      } else if (item.image) {
        snapshotImgString = item.image;
      } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        snapshotImgString = product.images[0];
      }

      return {
        variantId: item.variantId || undefined,
        sku: dbVariant?.sku || item.sku || product.sku || "UNMAPPED-SKU",
        unitPrice: baselinePrice,
        quantity: itemQty,
        image: snapshotImgString // Will cleanly lock image into database collection records now
      };
    });

    // 4. Split Payment / Escrow Broker Computations
    const commissionRate = 0.05; 
    const commissionAmount = calculatedTotalPrice * commissionRate;
    const vendorPayoutAmount = calculatedTotalPrice - commissionAmount;

    // 5. Construct and Save order transaction document context
    const newOrder = new Order({
      productId: product._id,
      items: formattedOrderItems,
      businessId: businessId,
      ownerId: currentUserId,
      platformAccountId: platformAccountId,
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

    // 6. Stock Reduction Engine
    for (const item of formattedOrderItems) {
      if (item.variantId) {
        await Variant.findByIdAndUpdate(item.variantId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

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