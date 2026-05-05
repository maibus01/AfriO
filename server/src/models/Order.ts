import mongoose, { Schema, Document, Model, CallbackWithoutResultAndOptionalError } from "mongoose";

export interface IOrder extends Document {
  refNumber: string;

  productId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;

  platformAccountId: mongoose.Types.ObjectId;

  quantity: number;
  notes?: string;
  totalPrice: number;

  commission?: number;
  vendorAmount?: number;

  paymentMethod: "bank_transfer";

  // CUSTOMER VIEW
  customerStatus:
    | "pending_payment"
    | "processing"
    | "delivered"
    | "completed"
    | "cancelled";

  // INTERNAL
  internalStatus:
    | "pending_payment"
    | "payment_received"
    | "processing"
    | "ready_for_pickup"
    | "unavailable"
    | "delivered";

  paidToVendorAt?: Date;
  adminNotes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
   refNumber: {
  type: String,

},

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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

    platformAccountId: {
      type: Schema.Types.ObjectId,
      ref: "PlatformAccount",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    notes: {
      type: String,
      default: "",
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    commission: {
      type: Number,
      default: 0,
    },

    vendorAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["bank_transfer"],
      default: "bank_transfer",
    },

    customerStatus: {
      type: String,
      enum: ["pending_payment", "processing", "delivered", "completed", "cancelled"],
      default: "pending_payment",
    },

    internalStatus: {
      type: String,
      enum: [
        "pending_payment",
        "payment_received",
        "processing",
        "ready_for_pickup",
        "unavailable",
        "delivered",
      ],
      default: "pending_payment",
    },

    paidToVendorAt: Date,

    adminNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//
// 🔥 GENERATE REF NUMBER
//
OrderSchema.pre("save", async function () {
  if (!this.refNumber) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.refNumber = `ORD-${random}`;
  }
});

//
// ⚡ INDEXES
//
OrderSchema.index({ ownerId: 1 });
OrderSchema.index({ businessId: 1 });
OrderSchema.index({ internalStatus: 1 });
OrderSchema.index({ customerStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);