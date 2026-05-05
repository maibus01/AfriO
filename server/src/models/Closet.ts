import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICloset extends Document {
  userId: mongoose.Types.ObjectId;

  name: string;
  image?: string;

  quantity: number;

  source: "purchased" | "manual";

  // optional: track purchase origin
  vendorId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ClosetSchema: Schema<ICloset> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    source: {
      type: String,
      enum: ["purchased", "manual"],
      required: true,
    },

    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 🚀 fast user queries
ClosetSchema.index({ userId: 1 });

export const Closet: Model<ICloset> =
  mongoose.model<ICloset>("Closet", ClosetSchema);