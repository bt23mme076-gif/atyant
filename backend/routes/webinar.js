import express from 'express';
import WebinarRegistration from '../models/WebinarRegistration.js';
import { sendWebinarRegistrationEmail } from '../utils/emailService.js';

const router = express.Router();

// POST /api/webinar/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, college, yearOfStudy, stream, questions } = req.body;

    // Validate inputs
    if (!name || !email || !phone || !college || !yearOfStudy || !stream) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate phone number (simple check for 10-digit Indian numbers or international)
    const phoneClean = phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid mobile number' });
    }

    // Check if email already registered for this webinar
    const existingRegistration = await WebinarRegistration.findOne({
      email: email.toLowerCase(),
      webinarId: 'career-guidance-webinar-1'
    });

    if (existingRegistration) {
      return res.status(409).json({ message: 'This email is already registered for the webinar' });
    }

    // Save registration
    const registration = new WebinarRegistration({
      name,
      email: email.toLowerCase(),
      phone,
      college,
      yearOfStudy,
      stream,
      questions: questions || '',
      webinarId: 'career-guidance-webinar-1'
    });

    await registration.save();

    // Send confirmation email
    const webinarTitle = 'How to Crack an IIM Internship from a Tier-2 NIT';
    const webinarDate = 'Friday, July 18, 2026 at 6:00 PM IST';
    
    // Non-blocking email send to keep response times low
    sendWebinarRegistrationEmail(email, name, webinarTitle, webinarDate)
      .then(() => console.log(`✅ Webinar email sent to ${email}`))
      .catch(err => console.error(`❌ Webinar email FAILED for ${email}:`, err.message, err));

    res.status(201).json({
      message: 'Registration successful! Check your email for confirmation.',
      registration: {
        id: registration._id,
        name: registration.name,
        email: registration.email,
        webinarTitle,
        webinarDate
      }
    });

  } catch (error) {
    console.error('Webinar registration error:', error);
    res.status(500).json({ message: 'Server error occurred. Please try again.' });
  }
});

export default router;
