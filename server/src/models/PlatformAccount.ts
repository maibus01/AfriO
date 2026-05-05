// models/PlatformAccount.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlatformAccount extends Document {
  bankName: string;
  accountNumber: string;
  accountName: string;

  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlatformAccountSchema = new Schema<IPlatformAccount>(
  {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PlatformAccount: Model<IPlatformAccount> =
  mongoose.model<IPlatformAccount>("PlatformAccount", PlatformAccountSchema);