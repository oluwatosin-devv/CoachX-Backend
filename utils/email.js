const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');
const bcrypt = require('bcrypt');
const pug = require('pug');
const htmlToText = require('html-to-text');
const juice = require('juice');
const { text } = require('express');
const { verify } = require('jsonwebtoken');

module.exports = class Email {
  constructor(user, url) {
    this.user = user;
    this.to = user.email;
    this.firstName = user.fullName.split(' ')[0];
    this.url = url;
    this.from = 'CoachX <oluwatosin.dev@gmail.com>';
  }
  newTransporter() {
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
  }

  async sendEmail(template, subject, otp) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      otp,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: juice(html),
      text: htmlToText.convert(html),
    };

    await this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcomeEmail() {
    await this.sendEmail('verifyemail', 'Welcome to CoachX Family');
  }
  async sendPasswordResetEmail() {
    await this.sendEmail('resetPassword', 'Reset your Password');
  }
  async sendwaitlistmail() {
    await this.sendEmail('waitlist', `You're in. Welcome to CoachX.`);
  }

  async sendpromotionalmail() {
    await this.sendEmail('promotional', 'Big things are coming from CoachX');
  }
  async sendOtpmail() {
    //generate code.
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

    //hashedotp
    const hashedotp = await bcrypt.hash(otp, 12);
    await OTP.create({
      user: this.user.id,
      otp: hashedotp,
    });

    await this.sendEmail('verifyemail', 'Welcome to CoachX Family', otp);
  }
};
