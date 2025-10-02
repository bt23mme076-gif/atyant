import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import protect from '../middleware/authMiddleware.js';
import dotenv from "dotenv";
dotenv.config(); 
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a payment order
router.post('/create-order', protect, async (req, res) => {
  try {
    const options = {
      amount: 100, // Amount in paisa (e.g., 1.00 INR)
      currency: 'INR',
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Verify the payment
router.post('/verify-payment', protect, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
    // --- ADD THIS LOGIC ---
    const user = await User.findById(req.user.userId);
    if (user) {
        user.messageCredits += 20; // Add 20 credits on successful purchase
        await user.save();
    }
    res.json({ success: true, message: 'Payment verified successfully' });
} else {
    res.status(400).json({ success: false, message: 'Payment verification failed' });
}
    
});

export default router;