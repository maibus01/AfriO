import mongoose, { Document, Schema, Model, Query } from "mongoose";

// =======================
// INTERFACE
// =======================
export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  images: string[];

  category: "fabric" | "shoes" | "caps" | "machines" | "other";

  stock: number;
  sold: number;

  businessId: mongoose.Types.ObjectId; // vendor business
  ownerId: mongoose.Types.ObjectId;    // redundancy for fast filtering

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  isOwner(userId: string): boolean;
}

// =======================
// SCHEMA
// =======================
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      enum: ["fabric", "shoes", "caps", "machines", "other"],
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    sold: {
      type: Number,
      default: 0,
    },

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
// INDEXES
// =======================
ProductSchema.index({ businessId: 1 });
ProductSchema.index({ ownerId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: "text" }); // search like Amazon

// =======================
// OWNER CHECK
// =======================
ProductSchema.methods.isOwner = function (
  this: IProduct,
  userId: string
): boolean {
  return this.ownerId.toString() === userId;
};

// =======================
// SOFT DELETE FILTER
// =======================
ProductSchema.pre(/^find/, function (this: Query<any, IProduct>) {
  this.where({ isActive: true });
});

// =======================
// MODEL
// =======================
export const Product: Model<IProduct> =
  mongoose.model<IProduct>("Product", ProductSchema);