import nodemailer from 'nodemailer';

// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
   auth: {
    user: process.env.SMTP_USER ,
    pass: process.env.SMTP_PASSWORD,
  },
});
 export default transporter;