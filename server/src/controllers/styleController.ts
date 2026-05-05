import { Request, Response, NextFunction } from "express";
import { Style } from "../models/Style";
import { Business } from "../models/Business";

// =========================
// CREATE STYLE (TAILOR ONLY)
// =========================
export const createStyle = async (
  req: Request,
  res: Response
) => {
  try {
    const { title, description, image, category, businessId } = req.body;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your business" });
    }

    if (business.category !== "tailor") {
      return res.status(400).json({
        message: "Only tailor businesses can create styles",
      });
    }

    const style = await Style.create({
      title,
      description,
      image,
      category,
      businessId,
      ownerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: style,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// GET MY STYLES
// =========================
export const getMyStyles = async (req: Request, res: Response) => {
  try {
    console.log("USER:", req.user); // 👈 ADD THIS

    const styles = await Style.find({
      ownerId: req.user.id,
    }).populate("businessId");

    res.json({
      success: true,
      data: styles,
    });
  } catch (err) {
    console.error("GET MY STYLES ERROR:", err); // 👈 VERY IMPORTANT
    res.status(500).json({ message: "Error fetching styles" });
  }
};

export const getAllStylesAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const styles = await Style.find()
      .populate("businessId")
      .populate("ownerId");

    res.status(200).json({
      success: true,
      data: styles,
    });
  } catch (err) {
    next(err);
  }
};


export const getStylesByBusiness = async (req: Request, res: Response) => {
  try {
    const styles = await Style.find({
      businessId: req.params.businessId,
      isActive: true,
    }).populate("businessId");

    res.json({
      success: true,
      data: styles,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching styles" });
  }
};

// =========================
// UPDATE STYLE
// =========================
export const updateStyle = async (
  req: Request,
  res: Response
) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      return res.status(404).json({ message: "Style not found" });
    }

    if (style.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowed = ["title", "description", "image", "category"];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (style as any)[field] = req.body[field];
      }
    });

    await style.save();

    res.json({
      success: true,
      data: style,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating style" });
  }
};

// =========================
// DELETE STYLE (SOFT DELETE)
// =========================
export const deleteStyle = async (
  req: Request,
  res: Response
) => {
  try {
    const style = await Style.findById(req.params.id);

    if (!style) {
      return res.status(404).json({ message: "Style not found" });
    }

    if (style.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    style.isActive = false;
    await style.save();

    res.json({
      success: true,
      message: "Style deleted",
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting style" });
  }
};

// =========================
// PUBLIC: GET ALL STYLES
// =========================
export const getAllStyles = async (
  req: Request,
  res: Response
) => {
  try {
    const { category } = req.query;

    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    const styles = await Style.find(filter)
      .populate("businessId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      results: styles.length,
      data: styles,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching styles" });
  }
};

// =========================
// GET SINGLE STYLE
// =========================
export const getStyleById = async (
  req: Request,
  res: Response
) => {
  try {
    const style = await Style.findById(req.params.id)
      .populate("businessId");

    if (!style) {
      return res.status(404).json({ message: "Style not found" });
    }

    res.json({
      success: true,
      data: style,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching style" });
  }
};