import express from 'express';
const router = express.Router();
import { createMessage, getMessages, markMessageRead, deleteMessage } from '../controllers/messageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/')
  .post(createMessage)
  .get(protect, admin, getMessages);

router.route('/:id')
  .delete(protect, admin, deleteMessage);

router.route('/:id/read')
  .put(protect, admin, markMessageRead);

export default router;