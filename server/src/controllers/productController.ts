import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { Business } from "../models/Business";
import cloudinary from "../config/Cloudinary";

// Helper: shape multer-cloudinary files into our schema
const mapUploadedFiles = (files?: Express.Multer.File[]) =>
  (files || []).map((f: any) => ({
    url: f.path, // secure_url from cloudinary
    publicId: f.filename, // cloudinary public_id
  }));

// Helper: delete an array of public_ids from cloudinary
const destroyImages = async (publicIds: string[]) => {
  if (!publicIds.length) return;
  await Promise.allSettled(
    publicIds.map((id) => cloudinary.uploader.destroy(id)),
  );
};

// =========================
// CREATE PRODUCT
// =========================
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("🚀 Create Product called with body:", req.body);
  const uploaded = mapUploadedFiles(req.files as Express.Multer.File[]);
  console.log("📤 Uploaded files:", uploaded);

  try {
    const { name, description, price, category, stock, businessId } = req.body;

    if (!name || !price || !category || !businessId) {
      await destroyImages(uploaded.map((i) => i.publicId));
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (uploaded.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      await destroyImages(uploaded.map((i) => i.publicId));
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }

    if (business.ownerId.toString() !== req.user.id) {
      await destroyImages(uploaded.map((i) => i.publicId));
      return res
        .status(403)
        .json({ success: false, message: "Not your business" });
    }

    if (business.category !== "vendor") {
      await destroyImages(uploaded.map((i) => i.publicId));
      return res.status(400).json({
        success: false,
        message: "Only vendor businesses can add products",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim(),
      price: Number(price),
      stock: Number(stock) || 0,
      category,
      businessId,
      ownerId: req.user.id,
      images: uploaded as any,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    // rollback uploads on failure
    await destroyImages(uploaded.map((i) => i.publicId));
    next(err);
  }
};

// =========================
// UPDATE PRODUCT
// =========================
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const newUploaded = mapUploadedFiles(req.files as Express.Multer.File[]);

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      await destroyImages(newUploaded.map((i) => i.publicId));
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.ownerId.toString() !== req.user.id) {
      await destroyImages(newUploaded.map((i) => i.publicId));
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // text fields
    const allowed = ["name", "description", "price", "stock", "category"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (product as any)[field] =
          field === "price" || field === "stock"
            ? Number(req.body[field])
            : req.body[field];
      }
    });

    // Images the client wants to KEEP (array of publicIds sent as JSON string)
    let keepImages = product.images;
    if (req.body.keepImageIds) {
      const keepIds: string[] = JSON.parse(req.body.keepImageIds);
      const toRemove = product.images.filter(
        (img: any) => !keepIds.includes(img.publicId),
      );
      await destroyImages(toRemove.map((i: any) => i.publicId));
      keepImages = product.images.filter((img: any) =>
        keepIds.includes(img.publicId),
      );
    }

    product.images = [...keepImages, ...newUploaded] as any;

    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    await destroyImages(newUploaded.map((i) => i.publicId));
    next(err);
  }
};

// =========================
// DELETE PRODUCT (HARD DELETE + IMAGE CLEANUP)
// =========================
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await destroyImages(product.images.map((i: any) => i.publicId));
    await product.deleteOne();

    res.status(200).json({ success: true, message: "Product removed" });
  } catch (err) {
    next(err);
  }
};

// ---- the read endpoints stay the same ----
export const getMyProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find({ ownerId: req.user.id })
      .populate("businessId")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, results: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "businessId",
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, search } = req.query;
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    const products = await Product.find(filter)
      .populate("businessId")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, results: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

export const getProductsByBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find({
      businessId: req.params.businessId,
      isActive: true,
    }).populate("businessId");
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

export const getAllProductsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
