import { Request, Response, NextFunction } from "express";
import { Closet } from "../models/Closet";

// ✅ CREATE CLOSET ITEM
export const createClosetItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, image, quantity, source, vendorId } = req.body;

    // 🧠 RULE:
    // if purchased → vendorId should exist
    if (source === "purchased" && !vendorId) {
      return res.status(400).json({
        success: false,
        message: "Purchased items must have a vendorId",
      });
    }

    const closetItem = await Closet.create({
      userId: req.user.id,
      name,
      image,
      quantity,
      source,
      vendorId: source === "purchased" ? vendorId : null,
    });

    res.status(201).json({
      success: true,
      data: closetItem,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ GET MY CLOSET
export const getMyCloset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const items = await Closet.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ UPDATE CLOSET ITEM
export const updateClosetItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await Closet.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const allowed = ["name", "image", "quantity"];

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        (item as any)[key] = req.body[key];
      }
    });

    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE CLOSET ITEM
export const deleteClosetItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await Closet.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};