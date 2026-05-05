import mongoose, { Document, Schema, Model, Query } from "mongoose";
import bcrypt from "bcrypt";

// ✅ Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  photo?: string;
  role: "admin" | "user";
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ✅ Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    phone: {
  type: String,
  required: function (this: IUser) {
    return this.isNew; // ✅ only required when creating new user
  },
  unique: true,
  trim: true,
  match: [/^\+?[0-9]{7,15}$/, "Please use a valid phone number"],
},

    photo: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
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

// 🔐 Hash password
UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// 🔑 Compare password
UserSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🚫 Filter inactive users
UserSchema.pre(/^find/, function (this: Query<any, IUser>) {
  this.where({ isActive: true });
});

// ✅ Model
export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);