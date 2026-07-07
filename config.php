<?php
/**
 * Configuration file for the Contact Form
 */

// Brevo (Sendinblue) SMTP Credentials
define('SMTP_HOST', 'smtp-relay.brevo.com');
define('SMTP_PORT', 587); // or 465 for SSL
define('SMTP_USERNAME', 'your_brevo_email@example.com'); // Replace with your Brevo SMTP username
define('SMTP_PASSWORD', 'your_brevo_smtp_password'); // Replace with your Brevo SMTP master password

// Company Details
define('COMPANY_EMAIL', 'printempire.admin@gmail.com'); // Email where inquiries will be sent
define('COMPANY_NAME', 'The Print Empire');

// Sender Details (Usually the same as COMPANY_EMAIL or a dedicated no-reply)
define('FROM_EMAIL', 'no-reply@printempire.com'); 
define('FROM_NAME', 'The Print Empire Website');

// CSRF Secret Key (Change this to a random strong string in production)
define('CSRF_SECRET', 'printempire_secret_key_v1_xyz789');
