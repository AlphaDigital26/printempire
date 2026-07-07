<?php
/**
 * Contact Form Processor
 */

// Start session for CSRF protection
session_start();

// Include configuration
require_once 'config.php';

// Include PHPMailer classes manually
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'lib/PHPMailer/src/Exception.php';
require 'lib/PHPMailer/src/PHPMailer.php';
require 'lib/PHPMailer/src/SMTP.php';

// Set header for JSON response
header('Content-Type: application/json');

// Handle GET request to generate/fetch CSRF token
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'csrf_token') {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    echo json_encode(['token' => $_SESSION['csrf_token']]);
    exit;
}

// Process POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'message' => ''];

    // 1. Verify CSRF Token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $response['message'] = 'Invalid security token. Please refresh the page and try again.';
        echo json_encode($response);
        exit;
    }

    // 2. Check Honeypot (Spam Protection)
    // The field 'website_url' should be hidden via CSS. If filled, it's a bot.
    if (!empty($_POST['website_url'])) {
        // Silently fail for bots
        $response['success'] = true;
        $response['message'] = 'Thank you! Your message has been sent successfully.';
        echo json_encode($response);
        exit;
    }

    // 3. Sanitize and Validate Inputs
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $company = filter_input(INPUT_POST, 'company', FILTER_SANITIZE_STRING);
    $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

    if (empty($name) || empty($email) || empty($phone) || empty($subject) || empty($message)) {
        $response['message'] = 'Please fill out all required fields.';
        echo json_encode($response);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Please enter a valid email address.';
        echo json_encode($response);
        exit;
    }

    // Prepare Email Content
    $ip = $_SERVER['REMOTE_ADDR'];
    $date = date('Y-m-d H:i:s');

    // Email Body for Company
    $companyEmailBody = "
----------------------------------
New Inquiry Received

Name: $name
Email: $email
Phone: $phone
Company: " . ($company ?: 'N/A') . "
Subject: $subject

Message:
$message

Date & Time: $date

IP Address: $ip
----------------------------------
    ";

    // Auto-Reply Body for Visitor
    $visitorEmailBody = "
Dear $name,

Thank you for reaching out to " . COMPANY_NAME . ".

We have successfully received your inquiry and our team will review it shortly.

We usually respond within one business day.

If your request is urgent, you may also contact us through the phone number available on our website.

Regards,

" . COMPANY_NAME . "
    ";

    try {
        // --- Send Email to Company ---
        $mailToCompany = new PHPMailer(true);
        // Server settings
        $mailToCompany->isSMTP();
        $mailToCompany->Host       = SMTP_HOST;
        $mailToCompany->SMTPAuth   = true;
        $mailToCompany->Username   = SMTP_USERNAME;
        $mailToCompany->Password   = SMTP_PASSWORD;
        $mailToCompany->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mailToCompany->Port       = SMTP_PORT;

        // Recipients
        $mailToCompany->setFrom(FROM_EMAIL, FROM_NAME);
        $mailToCompany->addAddress(COMPANY_EMAIL);
        $mailToCompany->addReplyTo($email, $name); // Important: Reply-to visitor

        // Content
        $mailToCompany->isHTML(false);
        $mailToCompany->Subject = 'New Contact Inquiry - Print Empire: ' . $subject;
        $mailToCompany->Body    = $companyEmailBody;
        $mailToCompany->send();

        // --- Send Auto-Reply to Visitor ---
        $mailToVisitor = new PHPMailer(true);
        $mailToVisitor->isSMTP();
        $mailToVisitor->Host       = SMTP_HOST;
        $mailToVisitor->SMTPAuth   = true;
        $mailToVisitor->Username   = SMTP_USERNAME;
        $mailToVisitor->Password   = SMTP_PASSWORD;
        $mailToVisitor->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mailToVisitor->Port       = SMTP_PORT;

        $mailToVisitor->setFrom(FROM_EMAIL, FROM_NAME);
        $mailToVisitor->addAddress($email, $name);

        $mailToVisitor->isHTML(false);
        $mailToVisitor->Subject = 'Thank you for contacting ' . COMPANY_NAME;
        $mailToVisitor->Body    = $visitorEmailBody;
        
        // We don't fail the whole process if auto-reply fails, but we try to send it
        try {
            $mailToVisitor->send();
        } catch (Exception $e) {
            // Log error if needed, but don't expose to user
        }

        // Success response
        $response['success'] = true;
        $response['message'] = 'Thank you! Your message has been sent successfully.';
        
        // Reset CSRF token
        unset($_SESSION['csrf_token']);

        echo json_encode($response);
        exit;

    } catch (Exception $e) {
        // Log $e->getMessage() to a file in production
        $response['message'] = 'Something went wrong. Please try again later.';
        echo json_encode($response);
        exit;
    }
}

// Invalid request
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
exit;
