package com.brightloop.subscription.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@brightloop.io");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Notification email dispatched to {}", to);
        } catch (Exception ex) {
            logger.warn("Could not dispatch email via SMTP (mocked/offline mode). To: {}, Subject: {}. Error: {}", to, subject, ex.getMessage());
        }
    }

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String body = "Dear Brightloop User,\n\n"
                + "A password reset request was initiated for your account. Please use the following link to set a new password:\n"
                + resetUrl + "\n\n"
                + "This token will expire in 1 hour.\n\n"
                + "Best regards,\nBrightloop Software Team";
        sendEmail(to, "Password Reset Request - Brightloop Software", body);
    }

    public void sendInvoiceNotification(String to, String invoiceNumber, String totalAmount, String dueDate) {
        String body = "Dear Customer,\n\n"
                + "A new invoice " + invoiceNumber + " has been generated for your active subscription.\n"
                + "Total Amount: ₹" + totalAmount + "\n"
                + "Due Date: " + dueDate + "\n\n"
                + "You can view and pay your invoice through the Brightloop Customer Portal.\n\n"
                + "Thank you for your business,\nBrightloop Software Billing";
        sendEmail(to, "New Invoice Generated: " + invoiceNumber, body);
    }
}

