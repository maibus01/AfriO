import mongoose, { Document, Schema, Model } from "mongoose";

// =======================
// INTERFACE
// =======================
export interface IVariant extends Document {
    // RELATION
    productId: mongoose.Types.ObjectId;

    // FRONTEND MATCH
    sku: string;

    options: Record<string, string>;

    price: number;

    stock: number;

    images: string[];

    // SYSTEM
    businessId: mongoose.Types.ObjectId;

    ownerId: mongoose.Types.ObjectId;

    isActive: boolean;

    createdAt?: Date;

    updatedAt?: Date;
}

// =======================
// SCHEMA
// =======================
const VariantSchema = new Schema<IVariant>(
    {
        // =======================
        // PRODUCT RELATION
        // =======================
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        // =======================
        // VARIANT DATA
        // =======================
        sku: {
            type: String,
            required: true,
            trim: true,
        },

        options: {
            type: Schema.Types.Mixed,
            default: {},
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        images: {
            type: [String],
            default: [],
        },

        // =======================
        // OWNERSHIP
        // =======================
        businessId: {
            type: Schema.Types.ObjectId,
            ref: "Business",
            required: true,

        },

        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // =======================
        // STATUS
        // =======================
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
    productId: 1,
});

VariantSchema.index({
    sku: 1,
});

VariantSchema.index({
    businessId: 1,
});

// =======================
// MODEL
// =======================
export const Variant: Model<IVariant> =
    mongoose.model<IVariant>("Variant", VariantSchema);