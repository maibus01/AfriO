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

export const createProduct = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const {
      name,
      description,
      basePrice,
      category,
      stock,
      currency,
      condition,
      businessId,
    } = req.body;

    // =========================
    // AUTH CHECK
    // =========================
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =========================
    // BUSINESS CHECK
    // =========================
    const business =
      await Business.findById(
        businessId
      );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (
      business.ownerId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not your business",
      });
    }

    // =========================
    // IMAGE UPLOAD
    // =========================
    let imageUrls: string[] = [];

    if (
      req.files &&
      Array.isArray(req.files)
    ) {
      const uploads =
        await Promise.all(
          req.files.map((f: any) =>
            uploadToCloudinary(
              f.buffer
            )
          )
        );

      imageUrls = uploads.map(
        (r) => r.secure_url
      );
    }

    // =========================
    // SAFE JSON PARSER
    // =========================
    const safeParse = (
      v: any
    ) => {
      if (!v) return undefined;

      if (
        typeof v !== "string"
      ) {
        return v;
      }

      try {
        return JSON.parse(v);
      } catch {
        return undefined;
      }
    };

    // =========================
    // PARSED DATA
    // =========================
    const parsedFeatures =
      safeParse(
        req.body.features
      );

    const parsedVariants =
      safeParse(
        req.body.variants
      );

    const parsedMeasurement =
      safeParse(
        req.body.measurement
      );

    const parsedBulkPricing =
      safeParse(
        req.body.bulkPricing
      );

    const parsedOrigin =
      safeParse(
        req.body.origin
      );

    // =========================
    // CREATE PRODUCT
    // =========================
    const product =
      await Product.create({
        name,

        description,

        images: imageUrls,

        category,

        condition:
          condition || "new",

        basePrice: basePrice
          ? Number(basePrice)
          : 0,

        currency:
          currency || "NGN",

        stock: stock
          ? Number(stock)
          : 0,

        sold: 0,

        features:
          parsedFeatures || {},

        // ✅ STORE VARIANT IDS
        variants:
          parsedVariants || [],

        measurement:
          parsedMeasurement,

        bulkPricing:
          parsedBulkPricing ||
          [],

        origin: parsedOrigin,

        businessId,

        ownerId: req.user.id,

        isActive: true,
      });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(
      "CREATE PRODUCT ERROR:",
      err
    );

    next(err);
  }
};

export const uploadSingleImage = async (
  req: any,
  res: Response
) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const file = req.files[0];

    const uploaded = await uploadToCloudinary(file.buffer);

    return res.status(200).json({
      success: true,
      url: uploaded.secure_url,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
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
    }).populate("businessId")
    .populate("variants");

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
// export const getProductById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate("businessId")
//       .populate("ownerId")
//       .populate({
//         path: "variants",
//         model: "Variant",
//       });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: product,
//     });

//   } catch (err) {
//     next(err);
//   }
// };

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("businessId")
      .populate("ownerId")
      .populate({
        path: "variants",
        model: "Variant",
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ========================================================
    // GYARA: Tabbatar da tsarin Variants dangane da Features
    // ========================================================
    // Canza product din zuwa plain JavaScript object don mu iya taba shi lafiya
    const productObject = product.toObject();

    // Idan samfurin ba na mai variants ba ne, ko kuma babu variants din kwata-kwata
    if (!productObject.features?.variants || !productObject.variants) {
      productObject.variants = []; // Sanya shi empty array don tsaro a UI
    } else {
      // Idan yana da variants, muna iya tace wadanda suke da "isActive: true" kawai
      productObject.variants = productObject.variants.filter(
        (v: any) => v && v.isActive === true
      );
    }

    return res.status(200).json({
      success: true,
      data: productObject, // Maido da ingantaccen samfurin
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
    }).populate("businessId")
    .populate("variants");

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
    // AUTH
    // =========================
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =========================
    // BUSINESS VALIDATION
    // =========================
    const business = await Business.findById(
      req.body.businessId
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // =========================
    // SECURITY CHECK
    // =========================
    if (
      business.ownerId.toString() !==
      req.user.id
    ) {
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
            await uploadToCloudinary(
              file.buffer
            );

          return result.secure_url;
        })
      );

      imageUrls = uploads;
    }

    // =========================
    // SAFE JSON PARSER
    // =========================
    const safeParse = (value: any) => {
      if (!value) return undefined;

      if (typeof value !== "string") {
        return value;
      }

      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    };

    // =========================
    // OPTIONS
    // =========================
    const options =
      safeParse(req.body.options) || {};

    // =========================
    // SKU
    // =========================
    const sku =
      req.body.sku ||
      `VAR-${Date.now()}`;

    // =========================
    // CREATE VARIANT
    // =========================
  const variant = await Variant.create({
  sku,
  options,
  price: Number(req.body.price || 0),
  stock: Number(req.body.stock || 0),
  images: imageUrls,
  businessId: business._id,
  isActive: true,
});

// attach variant to product
if (req.body.productId) {
  await Product.findByIdAndUpdate(
    req.body.productId,
    {
      $push: {
        variants: variant._id,
      },
    }
  );
}

    // =========================
    // RESPONSE
    // =========================
    return res.status(201).json({
      success: true,
      message:
        "Variant created successfully",
      data: variant,
    });

  } catch (err) {
    console.error(
      "ADD VARIANT ERROR:",
      err
    );

    next(err);
  }
};

export const getVariantById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { productId, variantId } = req.params;

    // 1. Nemo Product ɗin da farko
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Parent Product not found",
      });
    }

    // 2. 🔴 DUBAWA NA TSARO: Shin wannan product ɗin ma yana da fasalin variants kuwa?
    // Idan "features.variants" kuskure ne (false) ko kuma babu "product.variants" array...
    if (!product.features?.variants || !product.variants) {
      return res.status(400).json({
        success: false,
        message: "This product does not support or contain any variants.",
      });
    }

    // 3. Tunda tsarin ya tabbatar samfurin yana da variants, yanzu muna iya kiran .some() lafiya lau
    const belongsToProduct = product.variants.some(
      (id: any) => id.toString() === variantId
    );

    if (!belongsToProduct) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This variant does not belong to the specified product.",
      });
    }

    // 4. Nemo variant ɗin tunda dukkan sharunansu sun cika
    const variant = await Variant.findById(variantId);
    if (!variant || !variant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Variant not found or inactive",
      });
    }

    return res.status(200).json({
      success: true,
      data: variant,
    });

  } catch (err) {
    console.error("GET VARIANT BY ID ERROR:", err);
    next(err);
  }
};

/**
 * Secures and fetches a specific variant only if it belongs to the specified product.
 * (The variant doesn't know its product, but the product validates the variant's ID).
 */
// export const updateVariant = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { variantId } =
//       req.params;

//     const variant =
//       await Variant.findById(
//         variantId
//       );

//     if (!variant) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Variant not found",
//       });
//     }

//     // =========================
//     // FIND PRODUCT
//     // =========================
//     const product =
//       await Product.findById(
//         variant.productId
//       );

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Product not found",
//       });
//     }

//     // =========================
//     // SECURITY
//     // =========================
//     if (
//       product.ownerId.toString() !==
//       req.user.id
//     ) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Not authorized",
//       });
//     }

//     // =========================
//     // UPDATE
//     // =========================
//     Object.assign(
//       variant,
//       req.body
//     );

//     await variant.save();

//     return res.status(200).json({
//       success: true,

//       message:
//         "Variant updated",

//       data: variant,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// export const deleteVariant = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { productId, variantId } = req.params;

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }

//     if (product.ownerId.toString() !== req.user.id) {
//       return res.status(403).json({ success: false, message: "Not authorized" });
//     }

//     product.variants = product.variants?.filter(v => v.id !== variantId);

//     await product.save();

//     res.status(200).json({
//       success: true,
//       message: "Variant deleted",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

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