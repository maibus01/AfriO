import mongoose, { Schema, Document } from "mongoose";

export interface IVariant extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  options: Record<string, string>;
  price: number;
  stock: number;
  weight?: number;
  images: string[];
}

const VariantSchema = new Schema<IVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    sku: { type: String, required: true },

    options: {
      type: Schema.Types.Mixed,
      default: {},
    },

    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    weight: { type: Number },

    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Variant = mongoose.model<IVariant>("Variant", VariantSchema);