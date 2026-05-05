import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeasurement extends Document {
  userId: mongoose.Types.ObjectId;
  label: string;

  upperBody?: {
    neck?: number;
    chest?: number;
    waist?: number; // single waist (used for shirts/jackets)
    shoulder?: number;
    sleeveLength?: number;
    bicep?: number;
    wrist?: number;
    shirtLength?: number;
  };

  lowerBody?: {
    waist?: number; // waist for pants
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

  createdAt: Date;
  updatedAt: Date;
}

const MeasurementSchema = new Schema<IMeasurement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    upperBody: {
      neck: { type: Number },
      chest: { type: Number },
      waist: { type: Number },
      shoulder: { type: Number },
      sleeveLength: { type: Number },
      bicep: { type: Number },
      wrist: { type: Number },
      shirtLength: { type: Number },
    },

    lowerBody: {
      waist: { type: Number },
      hip: { type: Number },
      inseam: { type: Number },
      outseam: { type: Number },
      thigh: { type: Number },
      knee: { type: Number },
      ankle: { type: Number },
      rise: { type: Number },
    },

    extras: {
      height: { type: Number },
      backLength: { type: Number },
      frontLength: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

MeasurementSchema.index({ userId: 1 });

export const Measurement: Model<IMeasurement> =
  mongoose.model<IMeasurement>("Measurement", MeasurementSchema);