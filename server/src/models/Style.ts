import mongoose, { Schema, Document, Model } from "mongoose";

// =======================
// INTERFACE
// =======================
export interface IStyle extends Document {
  title: string;
  description?: string;
  image: string;

  category: "men" | "women" | "kids" | "traditional" | "modern";

  businessId: mongoose.Types.ObjectId; // tailor business
  ownerId: mongoose.Types.ObjectId;

    price: number;
  priceType: "fixed" | "from";

  likes: number;

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

// =======================
// SCHEMA
// =======================
const StyleSchema = new Schema<IStyle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["men", "women", "kids", "traditional", "modern"],
      default: "modern",
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

    // 💰 PRICING
price: {
  type: Number,
  required: true,
  min: 0,
},

priceType: {
  type: String,
  enum: ["fixed", "from"],
  default: "from",
},

    likes: {
      type: Number,
      default: 0,
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
StyleSchema.index({ businessId: 1 });
StyleSchema.index({ ownerId: 1 });
StyleSchema.index({ category: 1 });

// =======================
// MODEL
// =======================
export const Style: Model<IStyle> =
  mongoose.model<IStyle>("Style", StyleSchema);