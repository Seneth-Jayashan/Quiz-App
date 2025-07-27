const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

exports.sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify/${token}`;

    const mailOptions = {
        from: `"Quiz App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your Quiz App account",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            
            <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Quiz App</h1>
            </div>
            
            <div style="padding: 30px; text-align: center;">
              <h2 style="color: #333;">Verify Your Email</h2>
              <p style="font-size: 16px; color: #555; line-height: 1.5;">
                Thanks for signing up! Please click the button below to verify your email address
                and activate your account.
              </p>

              <a href="${verificationLink}"
                 style="display: inline-block; padding: 12px 24px; margin-top: 20px;
                        background-color: #4CAF50; color: #fff; text-decoration: none; 
                        font-size: 16px; border-radius: 5px;">
                Verify Email
              </a>

              <p style="margin-top: 30px; font-size: 14px; color: #888;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #4CAF50; word-break: break-all;">
                ${verificationLink}
              </p>
            </div>
            
            <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              &copy; ${new Date().getFullYear()} Quiz App. All rights reserved.
            </div>
          </div>
        </div>`
    };

    return transporter.sendMail(mailOptions);
};
