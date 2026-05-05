import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

// 🔧 Normalize phone (GLOBAL)
const normalizePhone = (phone: string): string => {
  if (!phone) return phone;

  let cleaned = phone.replace(/\D/g, ""); // remove spaces, +, etc.

  // Handle Nigerian local format (optional fallback)
  if (cleaned.startsWith("0")) {
    cleaned = "234" + cleaned.slice(1);
  }

  return cleaned;
};

// 🔑 JWT
const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// ==========================
// ✅ REGISTER
// ==========================
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { name, email, password, phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    phone = normalizePhone(phone);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "user",
    });

    const token = signToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user,
      whatsappLink: `https://wa.me/${user.phone}`, // ✅ ready to use
    });
  } catch (err: any) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already in use`,
      });
    }

    next(err);
  }
};

// ==========================
// ✅ LOGIN
// ==========================
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user,
      whatsappLink: `https://wa.me/${user.phone}`,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================
// ✅ GET CURRENT USER
// ==========================
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
      whatsappLink: `https://wa.me/${user?.phone}`,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================
// ✅ GET ALL USERS (ADMIN)
// ==========================
export const getAllUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      users,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ==========================
// ✅ UPDATE USER
// ==========================
export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allowedFields = ["name", "photo", "phone"];

    const updates: any = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // normalize phone if updated
    if (updates.phone) {
      updates.phone = normalizePhone(updates.phone);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      user,
      whatsappLink: `https://wa.me/${user?.phone}`,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================
// 🔐 UPDATE PASSWORD
// ==========================
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    const token = signToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================
// 🚫 DEACTIVATE USER
// ==========================
export const deactivateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      isActive: false,
    });

    res.status(204).json({
      success: true,
      message: "Account deactivated",
    });
  } catch (err) {
    next(err);
  }
};