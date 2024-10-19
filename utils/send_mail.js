import { sendEmail } from './mail.config.js';
import { 
    VerifyingLogin
} from './htmlTemplate.js';



export const send_login_confirm_code = async (email,otp) => {
    try {
        // Replace the otp in the HTML template
        const htmlContent = VerifyingLogin.replace(/verificationCode/g, otp);
            
        const subject = "Confirm Your Two-Step Login Verification";

        // Send the email
        await sendEmail(email, subject, htmlContent);
        console.log('Email sent successfully');
    } catch (error) {
        console.log("Failed to send email: ", error);
        throw new Error("Failed to send email");
    }
};
