const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Parse URL-encoded bodies (as sent by standard HTML forms and fetch FormData)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('.'));

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Contact form API endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
        }

        // Construct the email
        const mailOptions = {
            from: `"${name}" <${process.env.SMTP_USER}>`, // Authenticated email sender
            replyTo: email,
            to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER, // Who receives the email
            subject: `New Website Contact: ${subject || 'No Subject'}`,
            text: `
You have received a new message from your website contact form.

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Subject: ${subject || 'N/A'}

Message:
${message}
            `,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                <br/>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Thank you! Your message has been sent successfully.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Sorry, there was an error sending your message. Please try again later.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
