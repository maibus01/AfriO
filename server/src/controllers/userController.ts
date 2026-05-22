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
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // 1. Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // 2. Security Best Practice: Don't let hackers know if an email exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email matches an account, a reset link has been sent!",
      });
    }

    // 3. Environmental checks
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS configuration is missing");
    }

    // 4. Generate a secure, short-lived token (15 minutes)
    const resetToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 5. Build the landing link pointing to your frontend domain setup
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    // 6. Define the transport configuration optimized for cloud hosts like Render
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Your 16-character Google App Password
      },
    });

    // 7. Dispatch the secure payload email
    await transporter.sendMail({
      from: `"LuxeeHub Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password - LuxeeHub",
      html: `
        <div style="font-family: sans-serif; padding: 30px; max-width: 500px; margin: 0 auto; border: 1px solid #f3f4f6; border-radius: 16px;">
          <h2 style="color: #f59e0b; margin-bottom: 4px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em;">LuxeeHub<span style="color: #111827;">.</span></h2>
          <p style="font-size: 11px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-top: 0; margin-bottom: 24px; letter-spacing: 0.05em;">Account Recovery</p>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">You requested a password reset for your account. Click the button below to secure a new password:</p>
          
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" 
               style="background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: bold; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
               Reset Password
            </a>
          </div>
          
          <p style="font-size: 11px; color: #ef4444; font-weight: bold; margin-top: 20px;">
            ⚠️ This secure access link will automatically expire in 15 minutes.
          </p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.4;">If you did not make this request, you can safely ignore this email. Your current security settings remain completely safe.</p>
        </div>
      `,
    });

    // 8. Return success response matches step 2 perfectly
    return res.status(200).json({
      success: true,
      message: "If that email matches an account, a reset link has been sent!",
    });

  } catch (err) {
    console.error("FORGOT PASSWORD CONTROLLER CRASH:", err);
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