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
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      businessId,
      items, // Expecting format: Array<{ variantId, sku, quantity, options }>
      notes,
      platformAccountId,
    } = req.body;

    // 1. Validate payment channel
    const account = await PlatformAccount.findById(platformAccountId);
    if (!account || !account.isActive) {
      return res.status(400).json({ message: "Invalid or inactive payment account" });
    }

    // 2. Structural data integrity checkpoint
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items array is required" });
    }

    // 3. Fetch master base product configuration details
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product context fallback unavailable" });
    }

    // 4. Extract total transaction unit quantity across variants
    const totalOrderQuantity = items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity || 0),
      0
    );

    // 5. Enforce minimum distribution volume constraints
    const absoluteMinOrder = product.measurement?.minOrder ?? 1;
    if (totalOrderQuantity < absoluteMinOrder) {
      return res.status(400).json({
        message: `Order volume validation failed. Minimal target is ${absoluteMinOrder} units.`,
      });
    }

    // 6. Secure Variant Database Resolution Loop
    let computedTotalPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      // Fetch data directly from separate Variant collection to prevent frontend price spoofing
      const DBVariant = await Variant.findOne({
        _id: item.variantId,
        businessId: businessId,
        isActive: true,
      });

      if (!DBVariant) {
        return res.status(404).json({ 
          message: `Variant reference identification tracking lost for ID: ${item.variantId}` 
        });
      }

      // Assert allocation depth limits match physical supply availability
      if (DBVariant.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for SKU ${DBVariant.sku}. Available: ${DBVariant.stock}, Requested: ${item.quantity}`,
        });
      }

      // Check variant pricing fallback architectures
      let targetUnitPrice = DBVariant.price > 0 ? DBVariant.price : (product.basePrice ?? 0);

      // Apply product-level measurement system alternative overrides if enabled
      if (product.features?.measurement && product.measurement?.pricePerUnit) {
        targetUnitPrice = product.measurement.pricePerUnit;
      }

      // Apply dynamic multi-tier volume discount scaling patterns
      if (product.features?.bulkPricing && product.bulkPricing && product.bulkPricing.length > 0) {
        // Find matching tier based on the TOTAL quantity ordered across all variants
        const matchedTier = product.bulkPricing.find(
          (tier) =>
            totalOrderQuantity >= tier.minQty &&
            (!tier.maxQty || totalOrderQuantity <= tier.maxQty)
        );
        if (matchedTier) {
          targetUnitPrice = matchedTier.price;
        }
      } else if (totalOrderQuantity >= 500) {
        // Fallback hardcoded 5% wholesale reduction algorithm 
        targetUnitPrice = targetUnitPrice * 0.95;
      }

      // Update structural loop metrics
      computedTotalPrice += targetUnitPrice * item.quantity;

      validatedItems.push({
        variantId: DBVariant._id,
        sku: DBVariant.sku,
        quantity: item.quantity,
        options: DBVariant.options || item.options || {},
      });
    }

    // 7. Deduct inventory limits safely across collections
    for (const item of validatedItems) {
      await Variant.findByIdAndUpdate(item.variantId, {
        $inc: { stock: -item.quantity },
      });
    }

    // 8. Compute system operational commissions
    const commission = computedTotalPrice * 0.10; // 10% operational margin logic
    const vendorAmount = computedTotalPrice - commission;

    // 9. Commit validated clean entry down to the Orders collection
    const order = await Order.create({
      productId: product._id,
      businessId,
      ownerId: req.user.id, // Derived securely from request token session validation middleware

      quantity: totalOrderQuantity,
      items: validatedItems,

      notes,
      totalPrice: computedTotalPrice,
      commission,
      vendorAmount,
      platformAccountId,

      customerStatus: "pending_payment",
      internalStatus: "pending_payment",
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error("SECURE MULTI-COLLECTION CREATE ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
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