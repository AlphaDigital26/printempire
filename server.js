const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require("helmet");
const compression = require("compression");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        "https://www.theprintempire.in",
        "https://theprintempire.in"
    ]
}));
app.use(helmet());
app.use(compression());

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

//Rate limiting middleware to prevent abuse
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `windowMs`
    message: { success: false, message: 'Too many requests sent from this IP, please try again after 15 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Contact form API endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, company, email, phone, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !phone || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Name, email, phone, subject, and message are required.' });
        }

        // Construct the email
        const mailOptions = {
            from: `"${name}" <${process.env.SMTP_USER}>`, // Authenticated email sender
            replyTo: email,
            to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER, // Who receives the email
            subject: `New Website Contact: ${subject}`,
            text: `
You have received a new message from your website contact form.

Name: ${name}
Company: ${company || 'N/A'}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${message}
            `,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Company:</strong> ${company || 'N/A'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Subject:</strong> ${subject}</p>
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