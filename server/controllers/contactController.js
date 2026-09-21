const Contact = require('../models/Contact');

// @desc    Submit a contact message from public visitors
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Field-level validation
    const errors = [];
    if (!name || !name.trim() || name.trim().length < 2) {
      errors.push('Name is required and must be at least 2 characters long.');
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!email || !email.trim() || !emailRegex.test(email.trim())) {
      errors.push('A valid email address is required.');
    }
    if (!subject || !subject.trim() || subject.trim().length < 3) {
      errors.push('Subject is required and must be at least 3 characters long.');
    }
    if (!message || !message.trim() || message.trim().length < 10) {
      errors.push('Message is required and must be at least 10 characters long.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      '';

    // Store contact message in MongoDB
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: clientIp,
    });

    console.log(`[Contact API] New contact message received from ${contact.name} (${contact.email}): "${contact.subject}" [ID: ${contact._id}]`);

    // Optional email dispatch if SMTP environment variables are configured
    const adminEmail = process.env.ADMIN_EMAIL || process.env.CONTACT_RECEIVER_EMAIL;
    const smtpHost = process.env.SMTP_HOST;
    if (adminEmail && smtpHost) {
      try {
        let nodemailer;
        try {
          nodemailer = require('nodemailer');
        } catch {
          // Nodemailer not installed
        }
        if (nodemailer) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Campus Skill Exchange" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            replyTo: contact.email,
            subject: `[Contact Form] ${contact.subject}`,
            text: `Name: ${contact.name}\nEmail: ${contact.email}\nSubject: ${contact.subject}\n\nMessage:\n${contact.message}`,
            html: `
              <h3>New Campus Skill Exchange Contact Message</h3>
              <p><strong>From:</strong> ${contact.name} (${contact.email})</p>
              <p><strong>Subject:</strong> ${contact.subject}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="background:#f1f5f9;padding:12px;border-left:4px solid #6366f1;">
                ${contact.message.replace(/\n/g, '<br/>')}
              </blockquote>
            `,
          });
          console.log(`[Contact API] Notification email dispatched to ${adminEmail}`);
        }
      } catch (mailErr) {
        console.warn('[Contact API] Optional email dispatch failed (stored safely in MongoDB):', mailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
      contactId: contact._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
};
