// import mongoose, { Document, Schema, Model } from "mongoose";

// // =======================
// // INTERFACE
// // =======================
// export interface IProduct extends Document {
//   name: string;
//   description?: string;
//   images: string[];

//   category: string;

//   condition: "new" | "used" | "refurbished";

//   basePrice?: number;
//   currency: "NGN" | "USD" | "CNY" | "GBP";

//   stock?: number;
//   sold?: number;

//   features: {
//     variants: boolean;
//     attributes: boolean;
//     size: boolean;
//     color: boolean;
//     weight: boolean;
//     measurement: boolean;
//     bulkPricing: boolean;
//     origin: boolean;
//   };

//   attributes?: Record<string, string[]>;

//   variants?: Array<{
//     id: string;
//     sku: string;
//     options: Record<string, string>;
//     price: number;
//     stock: number;
//     weight?: number;
//     images?: string[];
//   }>;

//   measurement?: {
//     unit: "meter" | "yard" | "kg" | "liter";
//     pricePerUnit: number;
//     minOrder: number;
//   };

//   bulkPricing?: Array<{
//     minQty: number;
//     maxQty?: number;
//     price: number;
//   }>;

//   origin?: {
//     country: string;
//     city: string;
//     factory?: string;
//     shop?: string;
//   };

//   shippingTemplateId?: mongoose.Types.ObjectId;

//   businessId: mongoose.Types.ObjectId;
//   ownerId: mongoose.Types.ObjectId;

//   isActive: boolean;

//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // =======================
// // SCHEMA
// // =======================
// const ProductSchema = new Schema<IProduct>(
//   {
//     name: { type: String, required: true, trim: true },
//     description: { type: String, default: "" },
//     images: { type: [String], default: [] },

//     category: { type: String, required: true },

//     condition: {
//       type: String,
//       enum: ["new", "used", "refurbished"],
//       default: "new",
//     },

//     basePrice: { type: Number, min: 0 },

//     currency: {
//       type: String,
//       enum: ["NGN", "USD", "CNY", "GBP"],
//       default: "NGN",
//     },

//     stock: { type: Number, default: 0 },
//     sold: { type: Number, default: 0 },

//     // =========================
//     // FEATURES
//     // =========================
//     features: {
//       variants: { type: Boolean, default: false },
//       attributes: { type: Boolean, default: false },
//       size: { type: Boolean, default: false },
//       color: { type: Boolean, default: false },
//       weight: { type: Boolean, default: false },
//       measurement: { type: Boolean, default: false },
//       bulkPricing: { type: Boolean, default: false },
//       origin: { type: Boolean, default: false },
//     },

//     // =========================
//     // ATTRIBUTES (dynamic)
//     // =========================
//     attributes: {
//       type: Schema.Types.Mixed,
//       default: {},
//     },

//     // =========================
//     // VARIANTS
//     // =========================
//     variants: {
//       type: [
//         {
//           id: { type: String },
//           sku: { type: String },
//           options: { type: Schema.Types.Mixed },
//           price: { type: Number },
//           stock: { type: Number },
//           weight: { type: Number },
//           images: { type: [String], default: [] },
//         },
//       ],
//       default: [],
//     },

//     // =========================
//     // MEASUREMENT
//     // =========================
//     measurement: {
//       unit: {
//         type: String,
//         enum: ["meter", "yard", "kg", "liter"],
//       },
//       pricePerUnit: Number,
//       minOrder: Number,
//     },

//     // =========================
//     // BULK PRICING
//     // =========================
//     bulkPricing: {
//       type: [
//         {
//           minQty: Number,
//           maxQty: Number,
//           price: Number,
//         },
//       ],
//       default: [],
//     },

//     // =========================
//     // ORIGIN
//     // =========================
//     origin: {
//       country: String,
//       city: String,
//       factory: String,
//       shop: String,
//     },

//     // =========================
//     // SHIPPING
//     // =========================
//     shippingTemplateId: {
//       type: Schema.Types.ObjectId,
//       ref: "ShippingTemplate",
//     },

//     // =========================
//     // OWNERSHIP
//     // =========================
//     businessId: {
//       type: Schema.Types.ObjectId,
//       ref: "Business",
//       required: true,
//     },

//     ownerId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // =======================
// // INDEXES (recommended)
// // =======================
// ProductSchema.index({ businessId: 1 });
// ProductSchema.index({ ownerId: 1 });
// ProductSchema.index({ category: 1 });
// ProductSchema.index({ name: "text" });

// // =======================
// // MODEL
// // =======================
// export const Product: Model<IProduct> =
//   mongoose.model<IProduct>("Product", ProductSchema);

import mongoose, { Document, Schema, Model } from "mongoose";

// =======================
// INTERFACE
// =======================
export interface IProduct extends Document {
  name: string;
  description?: string;
  images: string[];

  category: string;

  condition: "new" | "used" | "refurbished";

  basePrice?: number;
  currency: "NGN" | "USD" | "CNY" | "GBP";

  stock?: number;
  sold?: number;

  features: {
    variants: boolean;
    attributes: boolean;
    size: boolean;
    color: boolean;
    weight: boolean;
    measurement: boolean;
    bulkPricing: boolean;
    origin: boolean;
  };

  attributes?: Record<string, string[]>;

  variants?: Array<{
    id: string;
    sku: string;
    options: Record<string, string>;
    price: number;
    stock: number;
    weight?: number;
    images?: string[];
  }>;

  measurement?: {
    unit: "meter" | "yard" | "kg" | "liter";
    pricePerUnit: number;
    minOrder: number;
  };

  bulkPricing?: Array<{
    minQty: number;
    maxQty?: number;
    price: number;
  }>;

  origin?: {
    country: string;
    city: string;
    factory?: string;
    shop?: string;
  };

  shippingTemplateId?: mongoose.Types.ObjectId;

  businessId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

// =======================
// SCHEMA
// =======================
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },

    category: { type: String, required: true },

    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
      default: "new",
    },

    basePrice: { type: Number, min: 0 },

    currency: {
      type: String,
      enum: ["NGN", "USD", "CNY", "GBP"],
      default: "NGN",
    },

    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },

    // =========================
    // FEATURES
    // =========================
    features: {
      variants: { type: Boolean, default: false },
      attributes: { type: Boolean, default: false },
      size: { type: Boolean, default: false },
      color: { type: Boolean, default: false },
      weight: { type: Boolean, default: false },
      measurement: { type: Boolean, default: false },
      bulkPricing: { type: Boolean, default: false },
      origin: { type: Boolean, default: false },
    },

    // =========================
    // ATTRIBUTES (dynamic)
    // =========================
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // =========================
    // VARIANTS
    // =========================
    variants: {
      type: [
        {
          id: { type: String },
          sku: { type: String },
          options: { type: Schema.Types.Mixed },
          price: { type: Number },
          stock: { type: Number },
          weight: { type: Number },
          images: { type: [String], default: [] },
        },
      ],
      default: [],
    },

    // =========================
    // MEASUREMENT
    // =========================
    measurement: {
      unit: {
        type: String,
        enum: ["meter", "yard", "kg", "liter"],
      },
      pricePerUnit: Number,
      minOrder: Number,
    },

    // =========================
    // BULK PRICING
    // =========================
    bulkPricing: {
      type: [
        {
          minQty: Number,
          maxQty: Number,
          price: Number,
        },
      ],
      default: [],
    },

    // =========================
    // ORIGIN
    // =========================
    origin: {
      country: String,
      city: String,
      factory: String,
      shop: String,
    },

    // =========================
    // SHIPPING
    // =========================
    shippingTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "ShippingTemplate",
    },

    // =========================
    // OWNERSHIP
    // =========================
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =======================
// INDEXES (recommended)
// =======================
ProductSchema.index({ businessId: 1 });
ProductSchema.index({ ownerId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: "text" });

// =======================
// MODEL
// =======================
export const Product: Model<IProduct> =
  mongoose.model<IProduct>("Product", ProductSchema);