import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import protect from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Question from '../models/Question.js';
import { sendMentorPaymentNotification } from '../utils/emailService.js';
import dotenv from "dotenv";
dotenv.config(); 
const router = express.Router();

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not found in environment variables!');
} else {
  console.log('✅ Razorpay credentials loaded');
  console.log('🔑 Key ID:', process.env.RAZORPAY_KEY_ID);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a payment order
router.post('/create-order', protect, async (req, res) => {
  try {
    const options = {
      amount: 500, // Amount in paisa (e.g., 5.00 INR)
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

// Create Razorpay order for mentorship purchase
router.post('/create-mentorship-order', protect, async (req, res) => {
  try {
    const { amount, mentorshipType, questionId } = req.body;
    
    console.log('📝 Creating order for:', { amount, mentorshipType, questionId });
    
    if (!amount || !mentorshipType || !questionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Create short receipt ID (max 40 chars as per Razorpay requirement)
    const timestamp = Date.now().toString();
    const receipt = `M${timestamp.slice(-8)}`; // M + last 8 digits = 9 chars total
    
    console.log('🧾 Receipt ID:', receipt, 'Length:', receipt.length);
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        questionId: questionId.toString(),
        mentorshipType,
        userId: req.user.userId.toString()
      }
    };
    
    console.log('🔧 Order options:', JSON.stringify(options, null, 2));
    
    const order = await razorpay.orders.create(options);
    
    console.log('✅ Order created successfully:', order.id);
    
    res.json({
      success: true,
      order,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
    
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create order',
      details: error.error || error
    });
  }
});

// Verify mentorship payment
router.post('/verify-mentorship', protect, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      questionId,
      mentorshipType
    } = req.body;
    
    console.log('🔐 Verifying payment:', { 
      razorpay_order_id, 
      razorpay_payment_id, 
      questionId,
      mentorshipType 
    });
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    console.log('🔑 Signature check:', { 
      expected: expectedSignature.substring(0, 10) + '...', 
      received: razorpay_signature.substring(0, 10) + '...',
      match: expectedSignature === razorpay_signature
    });
    
    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature!');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }
    
    // Fetch payment details from Razorpay
    console.log('💳 Fetching payment details from Razorpay...');
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    console.log('💰 Payment status:', payment.status, 'Amount:', payment.amount / 100);
    
    if (payment.status !== 'captured') {
      console.error('❌ Payment not captured:', payment.status);
      return res.status(400).json({ 
        success: false, 
        error: `Payment not captured. Status: ${payment.status}` 
      });
    }
    
    // Find the question to get mentor ID
    const question = await Question.findById(questionId);
    
    if (!question) {
      console.error('❌ Question not found:', questionId);
      return res.status(404).json({ 
        success: false, 
        error: 'Question not found' 
      });
    }
    
    console.log('✅ Question found. Mentor ID:', question.selectedMentorId);
    
    if (!question.selectedMentorId) {
      console.error('❌ No mentor assigned to this question!');
      return res.status(400).json({
        success: false,
        error: 'No mentor assigned to this question'
      });
    }
    
    // Store payment in database
    const paymentRecord = await Payment.create({
      razorpayPaymentId: razorpay_payment_id,
      questionId,
      userId: req.user.userId,
      mentorId: question.selectedMentorId,
      mentorshipType,
      amount: payment.amount / 100, // Convert paise to rupees
      currency: payment.currency,
      status: 'captured',
      razorpayData: payment,
      createdAt: new Date()
    });
    
    console.log('💾 Payment record created:', paymentRecord._id);
    
    // Update question with payment status
    await Question.findByIdAndUpdate(questionId, {
      isPaid: true,
      paidMentorshipType: mentorshipType,
      paidAt: new Date()
    });
    
    console.log(`✅ Mentorship payment verified: ${mentorshipType} for question ${questionId}, Amount: ₹${paymentRecord.amount}`);
    
    // Get mentor and student details for email notification
    const mentor = await User.findById(question.selectedMentorId).select('name email');
    const student = await User.findById(req.user.userId).select('name');
    
    if (mentor && student) {
      try {
        // Send email notification to mentor
        await sendMentorPaymentNotification(
          mentor.email,
          mentor.name,
          student.name,
          mentorshipType,
          paymentRecord.amount,
          question.questionText
        );
        console.log('📧 Payment notification email sent to mentor:', mentor.email);
      } catch (emailError) {
        // Log error but don't fail the payment verification
        console.error('⚠️ Failed to send email notification:', emailError.message);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      payment: paymentRecord,
      mentorId: question.selectedMentorId // Return mentor ID for frontend redirect
    });
    
  } catch (error) {
    console.error('❌ Payment verification error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Verification failed',
      details: error.message
    });
  }
});

// Razorpay webhook for mentorship payments
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');
    
    const signature = req.headers['x-razorpay-signature'];
    
    if (digest !== signature) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body.event;
    const paymentData = req.body.payload.payment.entity;
    
    console.log('📥 Webhook received:', event);
    
    if (event === 'payment.captured') {
      console.log('✅ Payment captured:', paymentData.id);
      
      // Extract metadata from payment notes
      const questionId = paymentData.notes?.questionId;
      const mentorshipType = paymentData.notes?.mentorshipType;
      const userId = paymentData.notes?.userId;
      
      if (!questionId || !mentorshipType || !userId) {
        console.error('❌ Missing required payment metadata');
        return res.status(400).json({ error: 'Missing metadata' });
      }
      
      // Find the question to get mentor ID
      const question = await Question.findById(questionId);
      
      // Store payment in database
      const payment = await Payment.create({
        razorpayPaymentId: paymentData.id,
        questionId,
        userId,
        mentorId: question?.selectedMentorId,
        mentorshipType,
        amount: paymentData.amount / 100, // Convert paise to rupees
        currency: paymentData.currency,
        status: 'captured',
        razorpayData: paymentData,
        createdAt: new Date()
      });
      
      // Update question status
      if (questionId) {
        await Question.findByIdAndUpdate(questionId, {
          isPaid: true,
          paidMentorshipType: mentorshipType,
          paidAt: new Date()
        });
      }
      
      console.log(`✅ Payment recorded: ${mentorshipType} for question ${questionId}, Amount: ₹${payment.amount}`);
    }
    
    res.json({ status: 'ok' });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Check payment status for a question
router.get('/status/:questionId', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      questionId: req.params.questionId,
      status: 'captured'
    }).sort({ createdAt: -1 }); // Get the most recent payment
    
    if (payment) {
      res.json({
        isPaid: true,
        mentorshipType: payment.mentorshipType,
        amount: payment.amount,
        paidAt: payment.createdAt
      });
    } else {
      res.json({
        isPaid: false
      });
    }
    
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Get all payments for a user
router.get('/my-payments', protect, async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.userId,
      status: 'captured'
    })
    .populate('questionId', 'questionText')
    .populate('mentorId', 'name username')
    .sort({ createdAt: -1 });
    
    res.json(payments);
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get all payments received by a mentor
router.get('/mentor-earnings', protect, async (req, res) => {
  try {
    const payments = await Payment.find({
      mentorId: req.user.userId,
      status: 'captured'
    })
    .populate('userId', 'name username email')
    .populate('questionId', 'questionText')
    .sort({ createdAt: -1 });
    
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    res.json({
      payments,
      totalEarnings,
      totalSessions: payments.length
    });
    
  } catch (error) {
    console.error('Error fetching mentor earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

export default router;