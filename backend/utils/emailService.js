import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <onboarding@resend.dev>', // Use your verified domain when available
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
  try {
    const { data, error } = await resend.emails.send({
      from: 'Atyant <onboarding@resend.dev>',
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