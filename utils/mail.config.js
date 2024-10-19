import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

// Create the transporter object using nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Use Gmail service
    auth: {
        user: email,  // Sender email
        pass: password,  // Sender email password
    },
});

// Function to send email
export const sendEmail = (to, subject, htmlContent) => {
    const mailOptions = {
        from: `"bytebrain3" <${email}>`,  // Replace senderEmail with the email from env
        to: to,  // Recipient email
        subject: subject,  // Email subject
        html: htmlContent,  // Email HTML content
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);  // Reject the promise with error
            } else {
                resolve(info);  // Resolve the promise with info
            }
        });
    });
};
