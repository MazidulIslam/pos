const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Configure the transporter for Gmail SMTP
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends a generic email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"ProntoStack" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending failed:", error);
        // We don't throw error to avoid breaking the registration flow
        // but it should be logged.
        return null;
    }
};

/**
 * Sends a welcome email to new organization owners
 * @param {string} email - User email
 * @param {string} name - User first name
 * @param {string} orgName - Organization name
 */
const sendWelcomeEmail = async (email, name, orgName) => {
    const subject = `Welcome to ProntoStack, ${name}!`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4F46E5;">Welcome to ProntoStack!</h2>
            <p>Hi ${name},</p>
            <p>Your organization <strong>${orgName}</strong> has been successfully created. You can now start managing your team and projects.</p>
            <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Dashboard</a>
            </div>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br/>The ProntoStack Team</p>
        </div>
    `;
    return sendEmail(email, subject, html);
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
};
