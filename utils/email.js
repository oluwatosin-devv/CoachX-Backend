// const nodemailer = require('nodemailer');
// const OTP = require('../models/OTP');
// const bcrypt = require('bcrypt');
// const pug = require('pug');
// const htmlToText = require('html-to-text');
// const juice = require('juice');

// module.exports = class Email {
//   constructor(user, url) {
//     this.user = user;
//     this.to = user.email;
//     this.firstName = user.fullName.split(' ')[0];
//     this.url = url;
//     this.from = 'CoachX <oluwatosin.dev@gmail.com>';
//   }
//   newTransporter() {
//     if (process.env.NODE_ENV === 'development') {
//       return nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//           user: process.env.EMAIL_USERNAME,
//           pass: process.env.EMAIL_PASSWORD,
//         },
//       });
//     }

//     return nodemailer.createTransport({
//       host: process.env.BREVO_HOST,
//       port: process.env.BREVO_PORT,
//       auth: {
//         user: process.env.BREVO_LOGIN,
//         pass: process.env.BREVO_PASSWORD,
//       },
//     });
//   }

//   async sendEmail(template, subject, otp) {
//     const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
//       firstName: this.firstName,
//       url: this.url,
//       subject,
//       otp,
//     });
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html: juice(html),
//       text: htmlToText.convert(html),
//     };

//     const info = await this.newTransporter().sendMail(mailOptions);

//     if (process.env.NODE_ENV === 'development') {
//       console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
//     }
//   }

//   async sendWelcomeEmail() {
//     await this.sendEmail('verifyemail', 'Welcome to CoachX Family');
//   }
//   async sendPasswordResetEmail() {
//     await this.sendEmail('resetPassword', 'Reset your Password');
//   }
//   async sendwaitlistmail() {
//     await this.sendEmail('waitlist', `You're in. Welcome to CoachX.`);
//   }

//   async sendpromotionalmail() {
//     await this.sendEmail('promotional', 'Big things are coming from CoachX');
//   }
//   async sendOtpmail() {
//     const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

//     const hashedotp = await bcrypt.hash(otp, 12);
//     await OTP.create({
//       user: this.user._id,
//       otp: hashedotp,
//     });

//     console.log('Generated OTP:', otp);

//     await this.sendEmail('verifyemail', 'Welcome to CoachX Family', otp);
//   }
// };



const nodemailer = require("nodemailer");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const pug = require("pug");
const { convert } = require("html-to-text");
const juice = require("juice");

module.exports = class Email {
  constructor(user, url) {
    this.user = user;
    this.to = user.email;
    this.firstName = (user.fullName || "").split(" ")[0] || "there";
    this.url = url;

    // ✅ Use env for sender
    this.from = process.env.EMAIL_FROM || "CoachX <no-reply@coachx.xyz>";
  }

  newTransporter() {
    const isProd = process.env.NODE_ENV === "production";

    if (!isProd) {
      // DEV (Mailtrap)
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 2525),
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    // PROD (Brevo SMTP)
    return nodemailer.createTransport({
      host: process.env.BREVO_HOST,
      port: Number(process.env.BREVO_PORT || 587),
      auth: {
        user: process.env.BREVO_LOGIN,
        pass: process.env.BREVO_PASSWORD,
      },
    });
  }

  async sendEmail(template, subject, otp) {
    try {
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
        text: convert(html),
      };

      await this.newTransporter().sendMail(mailOptions);
    } catch (err) {
      // ✅ Do not throw: prevents signup from failing due to email issues
      console.error("Email send failed:", err.message);
    }
  }

  async sendWelcomeEmail() {
    return this.sendEmail("verifyemail", "Welcome to CoachX Family");
  }

  async sendPasswordResetEmail() {
    return this.sendEmail("resetPassword", "Reset your Password");
  }

  async sendwaitlistmail() {
    return this.sendEmail("waitlist", "You're in. Welcome to CoachX.");
  }

  async sendpromotionalmail() {
    return this.sendEmail("promotional", "Big things are coming from CoachX");
  }

  async sendOtpmail() {
    try {
      const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

      const hashedotp = await bcrypt.hash(otp, 12);

      // ✅ If your OTP schema needs expiresAt, add it here (10 mins example)
      await OTP.create({
        user: this.user._id,
        otp: hashedotp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await this.sendEmail("verifyemail", "Verify your CoachX account", otp);
    } catch (err) {
      console.error("OTP creation/send failed:", err.message);
    }
  }
};
