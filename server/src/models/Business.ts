import mongoose, { Document, Schema, Model, Query } from "mongoose";

// ✅ Interface
export interface IBusiness extends Document {
  name: string;
  category: "tailor" | "vendor";
  description?: string;
  logo?: string;
  coverImage?: string; // 👈 added
  phone: string;
  ownerId: mongoose.Types.ObjectId;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  isOwner(userId: string): boolean;
}

// ✅ Schema
const BusinessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["tailor", "vendor"],
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },


    coverImage: {
      type: String,
      default: "", // 👈 added
    },

    phone: {
      type: String,
      required: true,
      trim: true,
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

// ✅ Prevent duplicate business per category per user
BusinessSchema.index({ ownerId: 1, category: 1 }, { unique: true });

// ✅ Optional performance index
BusinessSchema.index({ ownerId: 1 });

// ✅ Ownership check
BusinessSchema.methods.isOwner = function (
  this: IBusiness,
  userId: string
): boolean {
  return this.ownerId.toString() === userId;
};

// 🚫 Prevent category change after creation
BusinessSchema.pre("save", async function (this: IBusiness) {
  if (!this.isNew && this.isModified("category")) {
    throw new Error("Category cannot be changed after creation");
  }
});

// 🚫 Filter inactive businesses
BusinessSchema.pre(/^find/, function (this: Query<any, IBusiness>) {
  this.where({ isActive: true });
});

// ✅ Model
export const Business: Model<IBusiness> =
  mongoose.model<IBusiness>("Business", BusinessSchema);