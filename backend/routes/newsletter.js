import express from 'express';
import { sendNewsletterWelcomeEmail } from '../utils/emailService.js';

const router = express.Router();

const subscribers = new Set(); // In-memory dedup; fine for this scale

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email required.' });
  }

  const normalized = email.toLowerCase().trim();

  if (subscribers.has(normalized)) {
    return res.status(200).json({ message: 'Already subscribed.' });
  }

  subscribers.add(normalized);

  sendNewsletterWelcomeEmail(normalized)
    .then(() => console.log(`✅ Newsletter sub: ${normalized}`))
    .catch(err => console.error(`❌ Newsletter email failed for ${normalized}:`, err.message));

  res.status(200).json({ message: 'Subscribed successfully.' });
});

export default router;
