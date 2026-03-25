// routes/resume.js
// Express router — Razorpay order create + verify + Canva link return
//
// npm install razorpay crypto
//
// .env variables needed:
//   RAZORPAY_KEY_ID=rzp_live_xxx
//   RAZORPAY_KEY_SECRET=xxx

import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { optionalAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Template Data (server side — Canva links NEVER sent to frontend directly)
const TEMPLATES = {
  1: { name: "Industrial focus", price: 6900, canvaLink: "https://docs.google.com/presentation/d/11T7fhWnJeA9OdM97OsvIF8cJIFdPP_h6qlcGh8uVogw/copy" },
  2: { name: "Tech Developer",  price: 6900, canvaLink: "https://docs.google.com/presentation/d/1y7yxncBrlXJpf9k9q7q82LjbzzxDl4xoW54YDl_sh3I/copy" },
  3: { name: "Executive Pro",   price: 6900, canvaLink: "https://docs.google.com/presentation/d/1LLkgH59RSz4WdZQNOHaJqd4NAZaEnBSby96OyjLK99A/copy" },
  4: { name: "Creative Bold",   price: 6900, canvaLink: "https://docs.google.com/presentation/d/1e6_JNRCLxX4QVQhx-Lmb1cBGpE4URGjcCpAqULhB-o4/copy" },
  5: { name: "Corporate Edge",  price: 6900, canvaLink: "https://docs.google.com/presentation/d/1e6_JNRCLxX4QVQhx-Lmb1cBGpE4URGjcCpAqULhB-o4/copy" },
  6: { name: "IIM Ahmedabad",   price: 6900, canvaLink: "https://docs.google.com/presentation/d/1rDfuWeIQLZ__7-G7GHaiHpuf3ewzSiIJusSpoaQ-V9E/copy" },
};

// ─── POST /api/resume/create-order ───────────────────────────────────────────
// Frontend calls this first to get a Razorpay order ID
router.post("/create-order", async (req, res) => {
  try {
    const { templateId } = req.body;
    const template = TEMPLATES[templateId];

    if (!template) {
      return res.status(400).json({ error: "Invalid template ID" });
    }

    const order = await razorpay.orders.create({
      amount:   template.price,   // in paise (49 * 100 = 4900)
      currency: "INR",
      receipt:  `receipt_${templateId}_${Date.now()}`,
      notes: { templateId: String(templateId) },
    });

    res.json({ id: order.id, amount: order.amount, currency: order.currency });

  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ─── POST /api/resume/verify-payment ─────────────────────────────────────────
// Called after Razorpay checkout succeeds — verifies signature, returns Canva link
router.post("/verify-payment", optionalAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      templateId,
    } = req.body;

    // 1. Verify Razorpay signature
    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // 2. Get Canva link for this template
    const template = TEMPLATES[templateId];
    if (!template) {
      return res.status(400).json({ error: "Invalid template ID" });
    }

    // 3. Save purchase for authenticated users (30 days)
    try {
      if (req.user && req.user._id) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            purchasedTemplates: {
              templateId: Number(templateId),
              paymentId: razorpay_payment_id,
              canvaLink: template.canvaLink,
              expiresAt,
            }
          }
        });
      }
    } catch (saveErr) {
      console.error('Failed to save purchase:', saveErr);
    }

    // 4. Return Canva link — only after verified payment
    res.json({ success: true, canvaLink: template.canvaLink });

  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;

// ─── GET /api/resume/purchase-status?templateId=1 ───────────────────────────
// Returns whether authenticated user owns an active purchase for the template
router.get('/purchase-status', optionalAuth, async (req, res) => {
  try {
    const templateId = Number(req.query.templateId || 0);
    if (!templateId) return res.status(400).json({ error: 'templateId required' });

    if (!req.user || !req.user._id) {
      return res.json({ owned: false });
    }

    const user = await User.findById(req.user._id).lean();
    if (!user) return res.json({ owned: false });

    const now = new Date();
    const found = (user.purchasedTemplates || []).find(p => Number(p.templateId) === templateId && new Date(p.expiresAt) > now);
    if (found) {
      return res.json({ owned: true, canvaLink: found.canvaLink, expiresAt: found.expiresAt });
    }

    return res.json({ owned: false });
  } catch (err) {
    console.error('purchase-status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});