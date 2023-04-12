const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        },
    });

    // plain object for email message
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
        // next 3 fields are filled in via options on auth.js forgotPassword method
        to: options.email,
        subject: options.subject,
        text: options.text,
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
}

module.exports = sendEmail;
