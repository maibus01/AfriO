import mongoose, {
  Document,
  Schema,
  Model,
} from "mongoose";

// =======================
// INTERFACE
// =======================
export interface IVariant
  extends Document {
 
  businessId: mongoose.Types.ObjectId;

  sku: string;

  options: Record<string, string>;

  price: number;

  stock: number;

  weight?: number;

  images: string[];

  isActive: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}

// =======================
// SCHEMA
// =======================
const VariantSchema =
  new Schema<IVariant>(
    {
        // =========================
      // BUSINESS
      // =========================
      businessId: {
        type: Schema.Types.ObjectId,

        ref: "Business",

        required: true,
      },

      // =========================
      // SKU
      // =========================
      sku: {
        type: String,

        required: true,

        trim: true,
      },

      // =========================
      // OPTIONS
      // Example:
      // { Color: "Red", Size: "XL" }
      // =========================
      options: {
        type: Schema.Types.Mixed,

        default: {},
      },

      // =========================
      // PRICE
      // =========================
      price: {
        type: Number,

        required: true,

        min: 0,
      },

      // =========================
      // STOCK
      // =========================
      stock: {
        type: Number,

        default: 0,

        min: 0,
      },

      // =========================
      // OPTIONAL WEIGHT
      // =========================
      weight: {
        type: Number,

        min: 0,
      },

      // =========================
      // IMAGES
      // =========================
      images: {
        type: [String],

        default: [],
      },

      // =========================
      // STATUS
      // =========================
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
VariantSchema.index({
  businessId: 1,
});

VariantSchema.index({
  sku: 1,
});

// =======================
// MODEL
// =======================
export const Variant: Model<IVariant> =
  mongoose.model<IVariant>(
    "Variant",
    VariantSchema
  );