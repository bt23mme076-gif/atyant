import { Resend } from 'resend';

// Initialize Resend only if API key is available
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY not found in environment variables. Email notifications will be disabled.');
} else {
  console.log('✅ Resend email service initialized successfully');
}

// Send notification to mentor when assigned a new question
export const sendMentorNewQuestionNotification = async (mentorEmail, mentorName, questionText, keywords) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping mentor question notification email.');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>',
      to: [mentorEmail],
      subject: '🎯 New Question Assigned to You - Share Your Experience',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">🎯 Atyant</h1>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 30px; border-radius: 10px; border-left: 4px solid #10b981;">
            <h2 style="color: #1f2937; margin-top: 0;">New Question Assigned to You!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Hi ${mentorName},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              A student has asked a question that matches your expertise. We've assigned it to you because you have experience in this area.
            </p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
              <h3 style="color: #10b981; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Question</h3>
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0;">
                ${questionText}
              </p>
            </div>
            
            ${keywords && keywords.length > 0 ? `
            <div style="margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Related Topics:</p>
              <div>
                ${keywords.slice(0, 5).map(kw => `
                  <span style="background-color: #d1fae5; color: #065f46; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; display: inline-block; margin: 4px;">
                    ${kw}
                  </span>
                `).join('')}
              </div>
            </div>
            ` : ''}
            
            <p style="color: #6b7280; line-height: 1.6; margin: 20px 0;">
              Share your real experience to help this student. Your answer will be transformed into an Atyant Answer Card.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/mentor-dashboard" 
                 style="background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                Answer Question
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.5;">
                💡 <strong>Remember:</strong> Share your real experience, not generic advice. Students value authentic stories of what worked and what didn't.
              </p>
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
      console.error('📧 Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Mentor question notification email sent to:', mentorEmail);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending mentor question notification:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to user when their answer is ready
export const sendUserAnswerReadyNotification = async (userEmail, userName, questionText, isFollowUp = false) => {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping user answer notification email.');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <notification@atyant.in>',
      to: [userEmail],
      subject: `✅ Your ${isFollowUp ? 'Follow-up ' : ''}Answer is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0;">✨ Atyant</h1>
          </div>
          
          <div style="background-color: #ede9fe; padding: 30px; border-radius: 10px; border-left: 4px solid #6366f1;">
            <h2 style="color: #1f2937; margin-top: 0;">🎉 Your Answer is Ready!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Hi ${userName},
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Great news! A mentor has answered your question${isFollowUp ? ' follow-up' : ''} based on their real experience.
            </p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #6366f1;">
              <h3 style="color: #6366f1; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Question</h3>
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0;">
                ${questionText}
              </p>
            </div>
            
            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.5;">
                ✨ <strong>What you'll get:</strong>
              </p>
              <ul style="color: #065f46; margin: 10px 0 0 0; padding-left: 20px;">
                <li>Real experience from someone who solved this</li>
                <li>Key mistakes to avoid</li>
                <li>Step-by-step actionable plan</li>
                <li>Realistic timeline and outcomes</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/my-questions" 
                 style="background-color: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                View Your Answer
              </a>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; font-size: 13px; margin-top: 20px; text-align: center;">
              💬 Have more questions? You can ask up to 2 follow-ups on the same answer!
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
      console.error('📧 Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User answer notification email sent to:', userEmail);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending user answer notification:', error);
    return { success: false, error: error.message };
  }
};
