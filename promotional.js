const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const pug = require('pug');
require('dotenv').config();
const htmlToText = require('html-to-text');
const juice = require('juice');
const Waitlist = require('./models/waitlistModel');

const DB = process.env.DB_STRING.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB).then(() => console.log('DB connection successful.....'));

// Create the transporter
const transporter = () => {
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.BREVO_HOST,
    port: process.env.BREVO_PORT,
    auth: {
      user: process.env.BREVO_LOGIN,
      pass: process.env.BREVO_PASSWORD,
    },
  });
};

// Verify connection
transporter().verify(function (error, success) {
  if (error) {
    console.log('❌ SMTP connection failed:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

// Function to send an email
async function sendEmail(template, subject, firstName, to) {
  const html = pug.renderFile(`${__dirname}/views/email/${template}.pug`, {
    firstName,
    subject,
  });
  const mailOptions = {
    from: '"CoachX" <oluwatosin.dev@gmail.com>',
    to,
    subject,
    text: htmlToText.convert(html),
    html: juice(html),
  };
  try {
    const info = await transporter().sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
}

const sendBulkMail = async function () {
  const waitlist = await Waitlist.find();

  // waitlist.forEach(async (el) => {
  //   const firstName = el.fullName.split(' ')[0];

  //   await sendEmail(
  //     'promotional',
  //     'All hands on deck, CoachX is evolving.',
  //     firstName,
  //     el.email
  //   );
  // });

  await sendEmail(
    'promotional',
    'All hands on deck — CoachX is evolving.',
    'oluwatosin',
    'oluwatosin.dev@gmail.com'
  );
};

sendBulkMail();
// sendEmail('promotional', 'Big things are coming from CoachX');
