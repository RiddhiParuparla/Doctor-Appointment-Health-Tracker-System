const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: '"HealthTrack Support" <noreply@healthtrack.com>',
      to: email,
      subject: 'Your Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #4F46E5;">HealthTrack Security</h2>
          <p>You requested a password reset. Use the following Code to proceed:</p>
          <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 12px;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #111827;">${otp}</span>
          </div>
          <p style="color: #6B7280; font-size: 12px; margin-top: 20px;">
            This code will expire in 10 minutes. If you did not request this, please ignore this email.
          </p>
        </div>
      `
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ OTP Email sent to ${email}`);
    } else {
      console.log('--- DEVELOPMENT MODE (NO SMTP DETECTED) ---');
      console.log(`🔑 OTP for ${email}: ${otp}`);
      console.log('-------------------------------------------');
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

module.exports = { sendOTP };
