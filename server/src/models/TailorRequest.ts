import mongoose, { Schema, Document, Model } from "mongoose";

// =======================
// INTERFACE
// =======================
export interface ITailorRequest extends Document {
  customerId: mongoose.Types.ObjectId;
  tailorId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;

  styleId: mongoose.Types.ObjectId;

  // ✅ OPTIONAL MEASUREMENT (ADDED LATER)
  measurementId?: mongoose.Types.ObjectId;

  // ✅ SNAPSHOT (FILLED WHEN MEASUREMENT IS ATTACHED)
  measurementSnapshot?: {
    upperBody?: {
      neck?: number;
      chest?: number;
      waist?: number;
      shoulder?: number;
      sleeveLength?: number;
      bicep?: number;
      wrist?: number;
      shirtLength?: number;
    };
    lowerBody?: {
      waist?: number;
      hip?: number;
      inseam?: number;
      outseam?: number;
      thigh?: number;
      knee?: number;
      ankle?: number;
      rise?: number;
    };
    extras?: {
      height?: number;
      backLength?: number;
      frontLength?: number;
    };
  };

  note?: string;

  // 💰 PRICING
  price?: number;
  finalPrice?: number;

  paymentMethod: "bank_transfer";

  // 👤 CUSTOMER STATUS
  customerStatus:
    | "pending_review"
    | "pending_payment"
    | "processing"
    | "completed"
    | "cancelled";

  // 🔐 INTERNAL STATUS
  internalStatus:
    | "pending_review"
    | "price_set"
    | "payment_received"
    | "processing"
    | "completed"
    | "cancelled";

  deadline?: Date;

  priceSetAt?: Date;
  paidAt?: Date;
  startedAt?: Date;
  completedAt?: Date;

  adminNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

// =======================
// SCHEMA
// =======================
const TailorRequestSchema = new Schema<ITailorRequest>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tailorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    styleId: {
      type: Schema.Types.ObjectId,
      ref: "Style",
      required: true,
      index: true,
    },

    // ✅ OPTIONAL MEASUREMENT
    measurementId: {
      type: Schema.Types.ObjectId,
      ref: "Measurement",
    },

    // ✅ SNAPSHOT (FILLED LATER)
    measurementSnapshot: {
      upperBody: {
        neck: Number,
        chest: Number,
        waist: Number,
        shoulder: Number,
        sleeveLength: Number,
        bicep: Number,
        wrist: Number,
        shirtLength: Number,
      },
      lowerBody: {
        waist: Number,
        hip: Number,
        inseam: Number,
        outseam: Number,
        thigh: Number,
        knee: Number,
        ankle: Number,
        rise: Number,
      },
      extras: {
        height: Number,
        backLength: Number,
        frontLength: Number,
      },
    },

    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    price: Number,
    finalPrice: Number,

    paymentMethod: {
      type: String,
      enum: ["bank_transfer"],
      default: "bank_transfer",
    },

    customerStatus: {
      type: String,
      enum: [
        "pending_review",
        "pending_payment",
        "processing",
        "completed",
        "cancelled",
      ],
      default: "pending_review",
    },

    internalStatus: {
      type: String,
      enum: [
        "pending_review",
        "price_set",
        "payment_received",
        "processing",
        "completed",
        "cancelled",
      ],
      default: "pending_review",
    },

    deadline: Date,

    priceSetAt: Date,
    paidAt: Date,
    startedAt: Date,
    completedAt: Date,

    adminNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// =======================
// INDEXES
// =======================
TailorRequestSchema.index({ customerId: 1, createdAt: -1 });
TailorRequestSchema.index({ tailorId: 1, createdAt: -1 });

TailorRequestSchema.index({ internalStatus: 1 });
TailorRequestSchema.index({ customerStatus: 1 });

// 🚫 prevent duplicate pending request
TailorRequestSchema.index(
  { customerId: 1, styleId: 1, internalStatus: 1 },
  {
    unique: true,
    partialFilterExpression: { internalStatus: "pending_review" },
  }
);

// =======================
// MODEL
// =======================
export const TailorRequest: Model<ITailorRequest> =
  mongoose.model<ITailorRequest>("TailorRequest", TailorRequestSchema);