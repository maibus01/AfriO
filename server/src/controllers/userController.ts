import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

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

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    // 1. Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // Security tip: Keeping message identical avoids email enumeration attacks
      return res.status(200).json({
        success: true,
        message: "If that email matches an account, a reset link has been sent!",
      });
    }

    // 2. Generate a token (Using short-lived JWT for safety)
    const resetToken = jwt.sign(
      { id: user._id.toString() }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: "15m" } // Links expire quickly for security
    );

    // 3. Construct your frontend's reset page link 
    // Example: https://luxeehub.com/reset-password/your_jwt_token
    const origin = req.get("origin") || "http://localhost:5173";
    const resetUrl = `${origin}/reset-password/${resetToken}`;

    // 4. Send the Email
    try {
      // TODO: Replace this log with your nodemailer, SendGrid, or Resend code:
      // await sendEmail({ email: user.email, subject: "Password Reset", body: resetUrl });
      console.log(`✉️ Password reset link for ${user.email}: ${resetUrl}`);
      
    } catch (emailErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "If that email matches an account, a reset link has been sent!",
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