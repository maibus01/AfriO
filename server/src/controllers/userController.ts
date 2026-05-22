import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import nodemailer from "nodemailer";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

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
// 🔑 FORGOT PASSWORD
// ==========================
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // ✅ Don't reveal if user exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email matches an account, a reset link has been sent!",
      });
    }

    const resetToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const origin = req.get("origin") || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password/${resetToken}`;

    // ✅ Better transporter config
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Verify connection (very useful for debugging)
    await transporter.verify();

    await transporter.sendMail({
      from: `"LuxeeHub Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family:sans-serif;padding:20px;">
          <h2 style="color:#f59e0b;">LuxeeHub</h2>
          <p>Click below to reset your password:</p>
          <a href="${resetUrl}" 
             style="background:#000;color:#fff;padding:10px 15px;border-radius:6px;text-decoration:none;">
             Reset Password
          </a>
          <p style="font-size:12px;color:gray;">Expires in 15 minutes</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "If that email matches an account, a reset link has been sent!",
    });

  } catch (err) {
    console.error("EMAIL ERROR:", err); // 👈 IMPORTANT
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


export const updateMe = async (
  req: Request & { user?: any; file?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);

    // ❗ Prevent crash if auth failed
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no user found in request",
      });
    }

    const updates: any = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;

    // 🔥 IMAGE UPLOAD
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updates.photo = result.secure_url;
    }

    const userId = req.user._id || req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err);
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