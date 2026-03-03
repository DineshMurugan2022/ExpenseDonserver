const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials are not fully configured. Verification emails will fail.');
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}`;
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@expensetracker.com',
        to: email,
        subject: 'Please verify your email',
        text: `Click the link to verify your account: ${verifyUrl}`,
        html: `<p>Thank you for registering! Please <a href="${verifyUrl}">verify your email</a> to activate your account.</p>`,
    });

    console.log('Verification email sent:', info.messageId);
};

module.exports = {
    sendVerificationEmail,
};