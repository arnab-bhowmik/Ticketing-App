import nodemailer from 'nodemailer';

// Create an instance of NodeMailer Transporter
const transporter = nodemailer.createTransport({
  host: 'in-v3.mailjet.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_API_SECRET
  },
  tls: {
    rejectUnauthorized: false,              // Do not fail on invalid certificates
  },
});

// Function to send notification emails to Users
export const sendEmail = async (receiver: string, subject: string, content: string) => {
    try {      
        transporter.sendMail({
            from: 'ticketmart.notifications@gmail.com',
            to:   receiver,
            subject: subject,
            text: content
        });
    } catch (err) {
        console.log('Error while sending email to the User: ', err);
    }
}