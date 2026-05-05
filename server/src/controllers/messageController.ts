import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const {
      conversationId,
      senderId,
      receiverId,
      text,
      type,
      template,
    } = req.body;

    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      text,
      type: type || "text",
      template,
    });

    // 🪄 Update conversation preview
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageAt: new Date(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId, userId } = req.body;

    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating messages", error });
  }
};