const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the transporter
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.BREVO_LOGIN,
    pass: process.env.BREVO_PASSWORD,
  },
});

// Verify connection
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ SMTP connection failed:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

// Function to send an email
async function sendEmail() {
  try {
    const info = await transporter.sendMail({
      from: '"CoachX" <oluwatosin.dev@gmail.com>', // Must be verified in Brevo
      to: 'bookhizic@gmail.com',
      subject: 'Welcome to CoachX',
      text: 'Hello! Welcome to our platform.',
      html: '<h3>Hello!</h3><p>Welcome to our platform 🚀</p>',
    });
    console.log('✅ Email sent successfully:', info.messageId);
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
}

sendEmail();
