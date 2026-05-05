import mongoose, { Schema, Document, Model } from "mongoose";


export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;

  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;

  text?: string;

  type: "text" | "template";
  template?: "is_available" | "interested" | "price_negotiation";

  isRead: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: String,

    type: {
      type: String,
      enum: ["text", "template"],
      default: "text",
    },

    template: {
      type: String,
      enum: ["is_available", "interested", "price_negotiation"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);