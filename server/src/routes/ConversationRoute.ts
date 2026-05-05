import { Router } from "express";
import {
  startConversation,
  getConversations,
} from "../controllers/ConversationController";

const router = Router();

/**
 * @route   POST /api/conversations
 * @desc    Start or get existing conversation
 */
router.post("/", startConversation);

/**
 * @route   GET /api/conversations/:userId
 * @desc    Get all conversations for a user (inbox)
 */
router.get("/:userId", getConversations);

export default router;