import { Resend } from 'resend';

// Initialize Resend only if API key is available
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is missing from environment. All emails will be skipped. Set it in Vercel → Settings → Environment Variables.');
} else {
  console.log('✅ Resend initialized. Key prefix:', RESEND_API_KEY.slice(0, 8) + '...');
}

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping password reset email.');
    return { success: false, error: 'Email service not configured' };
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>', // Use your verified domain when available
      to: [email],
      subject: 'Password Reset Request - Atyant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Atyant</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #4F46E5;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset the password for your Atyant account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              To reset your password, click the button below. This link will expire in 1 hour for security reasons.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; font-size: 14px; margin-top: 30px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${resetUrl}" style="color: #4F46E5; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>This email was sent by Atyant. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Atyant. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send email');
    }

    console.log('Password reset email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, username) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping password reset confirmation email.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>',
      to: [email],
      subject: 'Password Reset Successful - Atyant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Atyant</h1>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 30px; border-radius: 10px; border-left: 4px solid #22c55e;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Successful</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Hi ${username},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Your password has been successfully reset for your Atyant account. You can now log in using your new password.
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              If you didn't make this change, please contact our support team immediately.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Login to Your Account
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>This email was sent by Atyant. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Atyant. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send confirmation email');
    }

    console.log('Password reset confirmation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    throw error;
  }
};

// Send payment notification to mentor
export const sendMentorPaymentNotification = async (mentorEmail, mentorName, studentName, mentorshipType, amount, questionText) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping mentor payment notification email.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const mentorshipTypeLabel = {
      'chat': '1-on-1 Chat Session',
      'video': 'Video Call Session',
      'roadmap': 'Complete Roadmap'
    };

    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>',
      to: [mentorEmail],
      subject: `💰 New Payment Received - ${mentorshipTypeLabel[mentorshipType]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Atyant</h1>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 30px; border-radius: 10px; border-left: 4px solid #22c55e;">
            <h2 style="color: #1f2937; margin-top: 0;">🎉 New Payment Received!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Hi ${mentorName},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Great news! <strong>${studentName}</strong> has paid for a <strong>${mentorshipTypeLabel[mentorshipType]}</strong> with you.
            </p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Student:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${studentName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Service:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${mentorshipTypeLabel[mentorshipType]}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Amount:</td>
                  <td style="padding: 10px 0; color: #22c55e; font-weight: 700; font-size: 18px;">₹${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600; vertical-align: top;">Question:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${questionText}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              The student is waiting to connect with you. Please check your chat messages to start the session.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/chat" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Open Chat
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>This email was sent by Atyant. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Atyant. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send mentor notification email');
    }

    console.log('Mentor payment notification email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending mentor payment notification:', error);
    throw error;
  }
};

// Add mentor booking notification function
export const sendMentorBookingNotification = async ({
  mentorEmail,
  mentorName,
  userName,
  userEmail,
  scheduledAt,
  duration,
  bookingId,
  bookingAmount
}) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping mentor booking notification email.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>',
      to: [mentorEmail],
      subject: `📅 New Booking Received - ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Atyant</h1>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 30px; border-radius: 10px; border-left: 4px solid #22c55e;">
            <h2 style="color: #1f2937; margin-top: 0;">🎉 New Booking Received!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Hi ${mentorName},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Great news! <strong>${userName}</strong> has booked a <strong>${duration} ${duration === 1 ? 'session' : 'sessions'}</strong> with you.
            </p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Student:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Service:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${duration} ${duration === 1 ? 'session' : 'sessions'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Amount:</td>
                  <td style="padding: 10px 0; color: #22c55e; font-weight: 700; font-size: 18px;">₹${bookingAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600; vertical-align: top;">Scheduled:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${scheduledAt}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Booking ID:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${bookingId}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              The student is waiting to connect with you. Please check your chat messages to start the session.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/chat" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Open Chat
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>This email was sent by Atyant. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Atyant. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send mentor booking notification email');
    }

    console.log('Mentor booking notification email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending mentor booking notification:', error);
    throw error;
  }
};

// Add student booking confirmation function
export const sendStudentBookingConfirmation = async ({
  userEmail,
  userName,
  mentorName,
  scheduledAt,
  duration,
  bookingId,
  meetLink,
  manualSetup
}) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping student booking confirmation email.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>',
      to: [userEmail],
      subject: 'Booking Confirmation - Atyant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Atyant</h1>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 30px; border-radius: 10px; border-left: 4px solid #22c55e;">
            <h2 style="color: #1f2937; margin-top: 0;">Booking Confirmation</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Hi ${userName},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Your booking for a <strong>${duration} ${duration === 1 ? 'session' : 'sessions'}</strong> with <strong>${mentorName}</strong> has been confirmed.
            </p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Student:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Service:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${duration} ${duration === 1 ? 'session' : 'sessions'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Amount:</td>
                  <td style="padding: 10px 0; color: #22c55e; font-weight: 700; font-size: 18px;">₹${bookingAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600; vertical-align: top;">Scheduled:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${scheduledAt}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Booking ID:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${bookingId}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 30px;">
              The student is waiting to connect with you. Please check your chat messages to start the session.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meetLink}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Join Meet
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>This email was sent by Atyant. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Atyant. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send student booking confirmation email');
    }

    console.log('Student booking confirmation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending student booking confirmation:', error);
    throw error;
  }
};

// Send newsletter welcome email
export const sendNewsletterWelcomeEmail = async (email) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping newsletter welcome email.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>',
      to: [email],
      subject: 'You\'re subscribed to Atyant updates',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAFAFA;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #7C3AED; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;">Atyant</h1>
            <p style="color: #6B7280; font-size: 14px; margin-top: 5px;">Intelligent Career Guidance Engine</p>
          </div>

          <div style="background-color: #FFFFFF; padding: 35px; border-radius: 16px; border: 1px solid #E5E7EB;">
            <h2 style="color: #1F2937; font-size: 20px; font-weight: 700; margin-top: 0;">You're on the list.</h2>
            <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
              We'll send you updates when new career guides, webinars, and resources drop — no spam, just the useful stuff.
            </p>
            <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin-bottom: 30px;">
              In the meantime, try the Atyant Engine — it gives you a personalized career path based on your profile in under 2 minutes.
            </p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="https://atyant.inhttps://atyant.in/"
                 style="background-color: #7C3AED; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; font-size: 15px;">
                Try the Atyant Engine →
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 24px; color: #9CA3AF; font-size: 12px;">
            <p>You're receiving this because you subscribed at atyant.in.</p>
            <p>&copy; 2026 Atyant. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Newsletter email error:', error);
      throw new Error('Failed to send newsletter welcome email');
    }

    console.log(`✅ Newsletter welcome email sent to ${email}`);
    return data;
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error);
    throw error;
  }
};

// Send webinar registration confirmation email
export const sendWebinarRegistrationEmail = async (email, name, webinarTitle, webinarDate) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping webinar registration confirmation email.');
    return { success: false, error: 'Email service not configured' };
  }

  // Pre-generate standard Google Calendar link
  // Webinar date example: June 25, 2026 at 6:00 PM IST
  // We can format URL properties (e.g. text, dates, details)
  const calendarTitle = encodeURIComponent(webinarTitle);
  const calendarDates = '20260718T123000Z/20260718T140000Z'; // July 18, 2026 6:00–7:30 PM IST = 12:30–14:00 UTC
  const calendarDetails = encodeURIComponent('Join Atyant\'s live career guidance webinar to break through your career block. Webinar Link: https://atyant.in/webinar');
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${calendarDates}&details=${calendarDetails}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>',
      to: [email],
      subject: '🎉 Webinar Registration Confirmed - Atyant',
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAFAFA;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #7C3AED; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;">Atyant</h1>
            <p style="color: #6B7280; font-size: 14px; margin-top: 5px;">Intelligent Career Guidance Engine</p>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 35px; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background-color: #EEF2F6; color: #7C3AED; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Registration Confirmed</span>
            </div>
            
            <h2 style="color: #1F2937; text-align: center; font-size: 22px; font-weight: 700; margin-top: 10px; margin-bottom: 8px;">🎉 You're In, ${name}!</h2>
            <p style="color: #4B5563; text-align: center; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
              We have successfully reserved your seat for the upcoming premium career Guidance webinar. Here are your event details:
            </p>
            
            <div style="background-color: #F9FAFB; padding: 24px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #F3F4F6;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 500; font-size: 14px; width: 100px;">Topic:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-weight: 600; font-size: 15px;">${webinarTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 500; font-size: 14px;">Speaker:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-weight: 600; font-size: 15px;">Nitin Rai (Founder &amp; CEO, Atyant — VNIT Nagpur)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 500; font-size: 14px;">Date & Time:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-weight: 600; font-size: 15px;">${webinarDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: 500; font-size: 14px;">Where:</td>
                  <td style="padding: 8px 0; color: #3B82F6; font-weight: 600; font-size: 15px;">Zoom Room (Link will be sent before start)</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${googleCalendarUrl}" target="_blank"
                 style="background-color: #7C3AED; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);">
                📅 Add to Google Calendar
              </a>
            </div>

            <p style="color: #6B7280; text-align: center; font-size: 13px; line-height: 1.5; margin: 0;">
              💡 <strong>Action Required:</strong> Make sure to add this event to your calendar so you don't miss the live interaction! An entry link will be shared 1 hour before the webinar.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9CA3AF; font-size: 12px;">
            <p>You received this email because you registered for the Atyant Webinar.</p>
            <p>&copy; 2026 Atyant. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send webinar confirmation email');
    }

    console.log('Webinar registration email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending webinar registration email:', error);
    throw error;
  }
};