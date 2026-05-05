import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  requestId: mongoose.Types.ObjectId;

  customerId: mongoose.Types.ObjectId;
  tailorId: mongoose.Types.ObjectId;

  lastMessage?: string;
  lastMessageAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Check this ref!
  lastMessage: String,
}, { timestamps: true });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);