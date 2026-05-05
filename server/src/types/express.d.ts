import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string; // keep this for simplicity
        _id?: mongoose.Types.ObjectId; // optional if you use it
        role?: string;
        businessId?: mongoose.Types.ObjectId; // 🔥 add this
      };
    }
  }
}

export {};