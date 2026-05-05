import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { Business } from "../models/Business";

// =========================
// CREATE PRODUCT (VENDOR ONLY)
// =========================
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price, images, category, stock, businessId } =
      req.body;

    // 🔐 check business belongs to user
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not your business",
      });
    }

    if (business.category !== "vendor") {
      return res.status(400).json({
        success: false,
        message: "Only vendor businesses can add products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      images,
      category,
      stock,
      businessId,
      ownerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProductsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find()
      .populate("businessId")
      .populate("ownerId");

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// =========================
// GET MY VENDOR PRODUCTS
// =========================
export const getMyProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find({
      ownerId: req.user.id,
    }).populate("businessId");

    res.status(200).json({
      success: true,
      results: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// PUBLIC: GET PRODUCT BY ID
// =========================
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id).populate("businessId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsByBusiness = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({
      businessId: req.params.businessId,
      isActive: true,
    }).populate("businessId");

    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

// =========================
// UPDATE PRODUCT
// =========================
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const allowed = ["name", "description", "price", "images", "stock", "category"];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (product as any)[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// DELETE PRODUCT (SOFT DELETE)
// =========================
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product removed",
    });
  } catch (err) {
    next(err);
  }
};

// =========================
// PUBLIC: GET ALL PRODUCTS
// =========================
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.query;

    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("businessId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};