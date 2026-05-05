import { Request, Response, NextFunction } from "express";
import { Business } from "../models/Business";

// ✅ CREATE BUSINESS
export const createBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, category, description, logo, coverImage, phone } = req.body; // 👈 added

    const business = await Business.create({
      name,
      category,
      description,
      logo,
      coverImage, // 👈 added
      phone,
      ownerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have a business of this category",
      });
    }

    next(err);
  }
};

export const getAllBusinesses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const businesses = await Business.find().populate("ownerId");

    res.json({
      success: true,
      businesses,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch businesses" });
  }
};

// ✅ GET MY BUSINESSES
export const getMyBusinesses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const businesses = await Business.find({
      ownerId: req.user.id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      results: businesses.length,
      data: businesses,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ GET SINGLE BUSINESS (only if owner)
export const getBusinessById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (!business.isOwner(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

export const getBusinessPublic = async (req: Request, res: Response) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business || !business.isActive) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE BUSINESS
export const updateBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (!business.isOwner(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const allowedUpdates = [
      "name",
      "description",
      "logo",
      "coverImage",
      "phone",
    ];

    const updateData: any = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedBusiness,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE BUSINESS (soft delete)
export const deleteBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (!business.isOwner(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    business.isActive = false;
    await business.save();

    res.status(200).json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};