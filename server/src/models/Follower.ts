import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFollow extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
  },
  { timestamps: true }
);

// 🚫 Prevent duplicate follow
FollowSchema.index({ userId: 1, businessId: 1 }, { unique: true });

export const Follow: Model<IFollow> =
  mongoose.model<IFollow>("Follow", FollowSchema);