import { Request, Response, NextFunction } from "express";
import { TailorRequest } from "../models/TailorRequest";
import { Style } from "../models/Style";
import { Measurement } from "../models/Measurement";
import { Business } from "../models/Business";

// =========================
// CREATE REQUEST (NO MEASUREMENT REQUIRED)
// =========================
export const createTailorRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { styleId, note } = req.body;

    // ✅ 1. VALIDATION
    if (!styleId) {
      return res.status(400).json({
        success: false,
        message: "Style is required",
      });
    }

    // ✅ 2. GET STYLE
    const style = await Style.findById(styleId);
    if (!style) {
      return res.status(404).json({
        success: false,
        message: "Style not found",
      });
    }

    // ✅ 3. VALIDATE BUSINESS
    const business = await Business.findById(style.businessId);
    if (!business || business.category !== "tailor") {
      return res.status(400).json({
        success: false,
        message: "Invalid tailor business",
      });
    }

    // ✅ 4. PREVENT DUPLICATE REQUEST
    const existing = await TailorRequest.findOne({
      customerId: req.user.id,
      styleId,
      internalStatus: "pending_review",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already requested this style",
      });
    }

    // =========================
    // ✅ 5. CREATE REQUEST (NO MEASUREMENT)
    // =========================
    const request = await TailorRequest.create({
      customerId: req.user.id,
      tailorId: style.ownerId,
      businessId: style.businessId,
      styleId,
      note,
      // ❌ no measurement yet
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// ADD MEASUREMENT TO REQUEST (LATER)
// =========================
export const addMeasurementToRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const { measurementId } = req.body;

    const request = await TailorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // 🔒 ownership check
    if (request.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ❗ prevent overwrite (optional but recommended)
    if (request.measurementId) {
      return res.status(400).json({
        success: false,
        message: "Measurement already added",
      });
    }

    // ❗ prevent adding after processing starts
    if (request.internalStatus !== "pending_review") {
      return res.status(400).json({
        success: false,
        message: "Cannot add measurement at this stage",
      });
    }

    // ✅ get measurement
    const measurement = await Measurement.findById(measurementId);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
    }

    // 🔒 ownership check
    if (measurement.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid measurement",
      });
    }

    // =========================
    // ✅ ATTACH + SNAPSHOT
    // =========================
    request.measurementId = measurementId;

    request.measurementSnapshot = {
      upperBody: measurement.upperBody || {},
      lowerBody: measurement.lowerBody || {},
      extras: measurement.extras || {},
    };

    await request.save();

    res.json({
      success: true,
      data: request,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to add measurement",
    });
  }
};

// =========================
// SET PRICE (ADMIN)
// =========================
export const setPriceByAdmin = async (req: Request, res: Response) => {
  try {
    const { price, deadline } = req.body;

    const request = await TailorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.price = price;
    request.finalPrice = price;
    request.deadline = deadline;

    request.internalStatus = "price_set";
    request.customerStatus = "pending_payment";
    request.priceSetAt = new Date();

    await request.save();

    res.json({ success: true, data: request });
  } catch {
    res.status(500).json({ success: false, message: "Failed to set price" });
  }
};

// =========================
// CONFIRM PAYMENT
// =========================
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const request = await TailorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.internalStatus = "payment_received";
    request.customerStatus = "processing";
    request.paidAt = new Date();

    await request.save();

    res.json({ success: true, data: request });
  } catch {
    res.status(500).json({ success: false, message: "Payment update failed" });
  }
};

// =========================
// START WORK (TAILOR)
// =========================
export const startTailorWork = async (req: Request, res: Response) => {
  try {
    const request = await TailorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // 🔒 only tailor
    if (request.tailorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // ❗ REQUIRE MEASUREMENT
    if (!request.measurementSnapshot) {
      return res.status(400).json({
        success: false,
        message: "Measurement must be added before starting",
      });
    }

    request.internalStatus = "processing";
    request.customerStatus = "processing";
    request.startedAt = new Date();

    await request.save();

    res.json({ success: true, data: request });
  } catch {
    res.status(500).json({ success: false, message: "Failed to start work" });
  }
};

// =========================
// COMPLETE REQUEST
// =========================
export const completeTailorRequest = async (req: Request, res: Response) => {
  try {
    const request = await TailorRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.internalStatus = "completed";
    request.customerStatus = "completed";
    request.completedAt = new Date();

    await request.save();

    res.json({ success: true, data: request });
  } catch {
    res.status(500).json({ success: false, message: "Failed to complete request" });
  }
};

// =========================
// GET MY REQUESTS
// =========================
export const getMyTailorRequests = async (req: Request, res: Response) => {
  const requests = await TailorRequest.find({
    customerId: req.user.id,
  })
    .populate("styleId", "title image")
    .populate("businessId", "name")
    .populate("measurementId") // ✅ updated
    .sort({ createdAt: -1 });

  res.json({ success: true, data: requests });
};

// =========================
// GET TAILOR REQUESTS
// =========================
export const getTailorRequests = async (req: Request, res: Response) => {
  const requests = await TailorRequest.find({
    tailorId: req.user.id,
  })
    .populate("customerId", "name email phone")
    .populate("styleId", "title image")
    .populate("measurementId") // ✅ updated
    .sort({ createdAt: -1 });

  res.json({ success: true, data: requests });
};

// =========================
// GET SINGLE REQUEST
// =========================
export const getTailorRequestById = async (req: Request, res: Response) => {
  const request = await TailorRequest.findById(req.params.id)
    .populate("styleId")
    .populate("businessId")
    .populate("customerId")
    .populate("measurementId"); // ✅ updated

  if (!request) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  const allowed =
    request.customerId.toString() === req.user.id ||
    request.tailorId.toString() === req.user.id;

  if (!allowed) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  res.json({ success: true, data: request });
};

// =========================
// ADMIN GET ALL
// =========================
export const getAllTailorRequestsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;

    const filter: any = {};
    if (status) filter.internalStatus = status;

    const requests = await TailorRequest.find(filter)
      .populate("customerId", "name email phone")
      .populate("tailorId", "name email")
      .populate("businessId", "name email phone")
      .populate("styleId", "title image")
      .populate("measurementId", "label upperBody lowerBody extras") // ✅ updated
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};