import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";

export const startConversation = async (req: Request, res: Response) => {
  try {
    const { requestId, customerId, tailorId } = req.body;

    // 🔍 Check if conversation already exists
    let conversation = await Conversation.findOne({
      requestId,
      customerId,
      tailorId,
    });

    // 🆕 If not, create it
    if (!conversation) {
      conversation = await Conversation.create({
        requestId,
        customerId,
        tailorId,
      });

      // 💬 Create first default message
      await Message.create({
        conversationId: conversation._id,
        senderId: customerId,
        receiverId: tailorId,
        type: "template",
        template: "is_available",
        text: "Is this item available?",
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Error starting conversation", error });
  }
};

// backend/controllers/ConversationController.ts

export const getConversations = async (req: any, res: any) => {
  try {
    // 1. Check if user exists (if using auth middleware)
    const userId = req.user?._id || req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // 2. Find conversations where the user is either the customer OR the tailor
    const conversations = await Conversation.find({
      $or: [
        { customerId: userId },
        { tailorId: userId }
      ]
    })
    .populate("customerId", "name email image") // Adjust fields based on your User model
    .populate("tailorId", "name image")
    .populate("requestId") // Ensure this matches the field name in your Conversation model
    .sort({ updatedAt: -1 });

    // 3. Always send an object with a 'data' key or a direct array
    res.status(200).json(conversations);
  } catch (error: any) {
    console.error("Backend Error in getConversations:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};