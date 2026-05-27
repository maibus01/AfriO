// import { Request, Response, NextFunction } from "express";
// import { Product } from "../models/Product";
// import { Business } from "../models/Business";

// // =========================
// // CREATE PRODUCT (VENDOR ONLY)
// // =========================
// export const createProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { name, description, price, images, category, stock, businessId } =
//       req.body;

//     // 🔐 check business belongs to user
//     const business = await Business.findById(businessId);

//     if (!business) {
//       return res.status(404).json({
//         success: false,
//         message: "Business not found",
//       });
//     }

//     if (business.ownerId.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "Not your business",
//       });
//     }

//     if (business.category !== "vendor") {
//       return res.status(400).json({
//         success: false,
//         message: "Only vendor businesses can add products",
//       });
//     }

//     const product = await Product.create({
//       name,
//       description,
//       price,
//       images,
//       category,
//       stock,
//       businessId,
//       ownerId: req.user.id,
//     });

//     res.status(201).json({
//       success: true,
//       data: product,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// export const getAllProductsAdmin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const products = await Product.find()
//       .populate("businessId")
//       .populate("ownerId");

//     res.json({
//       success: true,
//       products,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch products" });
//   }
// };

// // =========================
// // GET MY VENDOR PRODUCTS
// // =========================
// export const getMyProducts = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const products = await Product.find({
//       ownerId: req.user.id,
//     }).populate("businessId");

//     res.status(200).json({
//       success: true,
//       results: products.length,
//       data: products,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =========================
// // PUBLIC: GET PRODUCT BY ID
// // =========================
// export const getProductById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const product = await Product.findById(req.params.id).populate("businessId");

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: product,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// export const getProductsByBusiness = async (req: Request, res: Response) => {
//   try {
//     const products = await Product.find({
//       businessId: req.params.businessId,
//       isActive: true,
//     }).populate("businessId");

//     res.json({
//       success: true,
//       data: products,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching products" });
//   }
// };

// // =========================
// // UPDATE PRODUCT
// // =========================
// export const updateProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     if (product.ownerId.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized",
//       });
//     }

//     const allowed = ["name", "description", "price", "images", "stock", "category"];

//     allowed.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         (product as any)[field] = req.body[field];
//       }
//     });

//     await product.save();

//     res.status(200).json({
//       success: true,
//       data: product,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =========================
// // DELETE PRODUCT (SOFT DELETE)
// // =========================
// export const deleteProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     if (product.ownerId.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized",
//       });
//     }

//     product.isActive = false;
//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: "Product removed",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // =========================
// // PUBLIC: GET ALL PRODUCTS
// // =========================
// export const getAllProducts = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { category } = req.query;

//     const filter: any = {};

//     if (category) {
//       filter.category = category;
//     }

//     const products = await Product.find(filter)
//       .populate("businessId")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       results: products.length,
//       data: products,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Product } from "../models/Product";
import { Business } from "../models/Business";
import { Variant } from "../models/Variant";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";


// =========================
// UTILITY: CHECK BUSINESS OWNERSHIP
// =========================
const verifyBusinessOwnership = async (businessId: string, userId: string) => {
  const business = await Business.findById(businessId);

  if (!business) {
    return { error: "Business not found", status: 404 };
  }

  if (business.ownerId.toString() !== userId) {
    return { error: "Not your business", status: 403 };
  }

  if (business.category !== "vendor") {
    return { error: "Only vendor businesses can add products", status: 400 };
  }

  return { business };
};


// =========================
// CREATE PRODUCT (ADVANCED MODEL)
// =========================
// 🔧 helper: safe JSON parser (prevents crashes)
const parseIfJson = (value: any) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value; // fallback if invalid JSON
  }
};

export const createProduct = async (req: any, res: any, next: any) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      businessId,
    } = req.body;

    // 🔐 MUST exist
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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

    // 📸 images (safe fallback)
    let imageUrls: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      const uploads = await Promise.all(
        req.files.map((f: any) => uploadToCloudinary(f.buffer))
      );

      imageUrls = uploads.map((r) => r.secure_url);
    }

    // 🧠 SAFE JSON parsing ONLY if exists
    const safeParse = (v: any) => {
      if (!v) return undefined;
      if (typeof v !== "string") return v;
      try {
        return JSON.parse(v);
      } catch {
        return undefined;
      }
    };

    const product = await Product.create({
      name,
      description,
      basePrice: price ? Number(price) : undefined,
      category,
      stock: stock ? Number(stock) : 0,

      images: imageUrls,
      businessId,
      ownerId: req.user.id,

      features: safeParse(req.body.features),
      // variants: safeParse(req.body.variants),
      measurement: safeParse(req.body.measurement),
      bulkPricing: safeParse(req.body.bulkPricing),
      origin: safeParse(req.body.origin),
    });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    next(err);
  }
};

// =========================
// GET ALL PRODUCTS (ADMIN)
// =========================
export const getAllProductsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find()
      .populate("businessId")
      .populate("ownerId");

    res.json({
      success: true,
      results: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};


// =========================
// GET MY PRODUCTS
// =========================
export const getMyProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({
      ownerId: req.user.id,
      isActive: true,
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
// GET PRODUCT BY ID
// =========================
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("businessId")
      .populate("ownerId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};


// =========================
// GET PRODUCTS BY BUSINESS
// =========================
export const getProductsByBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({
      businessId: req.params.businessId,
      isActive: true,
    }).populate("businessId");

    res.json({
      success: true,
      results: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};


// =========================
// UPDATE PRODUCT (SAFE PATCH)
// =========================
export const updateProduct = async (req: any, res: Response, next: NextFunction) => {
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

    // 📸 1. Handle NEW image uploads (Cloudinary)
    let newImageUrls: string[] = [];

    if (req.files && req.files.length > 0) {
      const uploaded = await Promise.all(
        req.files.map((file: any) => uploadToCloudinary(file.buffer))
      );

      newImageUrls = uploaded.map((r) => r.secure_url);
    }

    // 🧠 2. Merge or replace logic
    const existingImages = product.images || [];

    const finalImages =
      newImageUrls.length > 0
        ? newImageUrls // replace mode
        : existingImages; // keep old

    // ⚙️ 3. Update allowed fields safely
    const allowedFields = [
      "name",
      "description",
      "category",
      "basePrice",
      "currency",
      "stock",
      "features",
      "attributes",
      "variants",
      "measurement",
      "bulkPricing",
      "origin",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (product as any)[field] =
          typeof req.body[field] === "string"
            ? JSON.parse(req.body[field])
            : req.body[field];
      }
    });

    // 📸 4. Set final images separately (IMPORTANT)
    product.images = finalImages;

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
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
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
      message: "Product soft deleted",
    });
  } catch (err) {
    next(err);
  }
};


// =========================
// PUBLIC: GET ALL PRODUCTS (FILTERED)
// =========================
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    const filter: any = {
      isActive: true,
    };

    if (category) filter.category = category;

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
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

export const addVariant = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  try {
    // =========================
    // FIND PRODUCT
    // =========================
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // =========================
    // SECURITY
    // =========================
    if (product.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =========================
    // CLOUDINARY UPLOAD
    // =========================
    let imageUrls: string[] = [];

    if (
      req.files &&
      Array.isArray(req.files)
    ) {
      const uploads = await Promise.all(
        req.files.map(async (file: any) => {
          const result =
            await uploadToCloudinary(file.buffer);

          return result.secure_url;
        })
      );

      imageUrls = uploads;
    }

    // =========================
    // OPTIONS
    // =========================
    let options = {};

    try {
      options =
        typeof req.body.options === "string"
          ? JSON.parse(req.body.options)
          : req.body.options;
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid options",
      });
    }

    // =========================
    // SKU
    // =========================
    const skuSuffix = Object.values(options)
      .join("-")
      .replace(/\s+/g, "")
      .toUpperCase();

    const sku =
      req.body.sku ||
      `${product.name
        .substring(0, 3)
        .toUpperCase()}-${skuSuffix}`;

    // =========================
    // SAVE VARIANT
    // =========================
    const variant = await Variant.create({
      productId: product._id,

      sku,

      options,

      price: Number(req.body.price || 0),

      stock: Number(req.body.stock || 0),

      images: imageUrls,

      businessId: product.businessId,

      ownerId: req.user.id,
    });

    // =========================
    // RESPONSE
    // =========================
    return res.status(201).json({
      success: true,
      message: "Variant saved successfully",
      data: variant,
    });

  } catch (err) {
    console.error(err);

    next(err);
  }
};

export const updateVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const variant = product.variants?.find(v => v.id === variantId);

    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    Object.assign(variant, req.body);

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant updated",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    product.variants = product.variants?.filter(v => v.id !== variantId);

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant deleted",
    });
  } catch (err) {
    next(err);
  }
};

export const decreaseStock = async (productId: string, qty: number) => {
  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");

  if ((product.stock || 0) < qty) {
    throw new Error("Insufficient stock");
  }

  product.stock = (product.stock || 0) - qty;
  product.sold = (product.sold || 0) + qty;

  await product.save();

  return product;
};

export const increaseStock = async (productId: string, qty: number) => {
  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");

  product.stock = (product.stock || 0) + qty;
  product.sold = Math.max((product.sold || 0) - qty, 0);

  await product.save();

  return product;
};

export const reserveStock = async (productId: string, qty: number) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      stock: { $gte: qty },
    },
    {
      $inc: {
        stock: -qty,
        reserved: qty,
      },
    },
    { new: true }
  );

  if (!product) {
    throw new Error("Insufficient stock");
  }

  return product;
};

export const getTopProducts = async (req: Request, res: Response) => {
  const products = await Product.find()
    .sort({ sold: -1 })
    .limit(10);

  res.json({
    success: true,
    data: products,
  });
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  const products = await Product.find({
    stock: { $lte: 5 },
    isActive: true,
  });

  res.json({
    success: true,
    data: products,
  });
};

export const getVendorStats = async (req: Request, res: Response) => {
  const stats = await Product.aggregate([
    { $match: { ownerId: new mongoose.Types.ObjectId(req.user.id) } },
    {
      $project: {
        revenue: { $multiply: ["$sold", "$basePrice"] },
        sold: 1,
        stock: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$revenue" },
        totalSold: { $sum: "$sold" },
      },
    },
  ]);

  res.json({
    success: true,
    data: stats[0] || { totalRevenue: 0, totalSold: 0 },
  });
};