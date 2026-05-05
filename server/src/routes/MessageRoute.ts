import { Router } from "express";
import {
  sendMessage,
  getMessages,
  markAsRead,
} from "../controllers/messageController";

const router = Router();

/**
 * @route   POST /api/messages
 * @desc    Send a message
 */
router.post("/", sendMessage);

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get all messages for a conversation
 */
router.get("/:conversationId", getMessages);

/**
 * @route   PATCH /api/messages/read
 * @desc    Mark messages as read
 */
router.patch("/read", markAsRead);

export default router;