import express from 'express';
const router = express.Router();
import { subscribeToNewsletter } from '../controllers/newsletterController.js';

router.post('/subscribe', subscribeToNewsletter);

export default router;
