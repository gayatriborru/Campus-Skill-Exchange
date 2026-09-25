const Contact = require('../models/Contact');
const { sendContactFormEmail } = require('../services/emailService');

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

    // 1. Store contact message in MongoDB first
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: clientIp,
      status: 'new',
      emailSent: false,
    });

    console.log(
      `[Contact API] Contact message saved in MongoDB [ID: ${contact._id}]: from ${contact.name} (${contact.email})`
    );

    // 2. Retrieve administrator recipient email strictly from environment variable (Never hardcoded)
    const adminEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      const configErrMsg =
        'Administrator recipient email is not configured on the server. Please ensure CONTACT_RECEIVER_EMAIL is set in environment variables.';
      console.error(`[Contact API] Delivery failed: ${configErrMsg}`);
      contact.emailDeliveryError = configErrMsg;
      await contact.save();

      return res.status(500).json({
        success: false,
        message: configErrMsg,
        contactId: contact._id,
      });
    }

    // 3. Dispatch email to CONTACT_RECEIVER_EMAIL
    const emailResult = await sendContactFormEmail({
      adminEmail,
      senderName: contact.name,
      senderEmail: contact.email,
      subject: contact.subject,
      message: contact.message,
    });

    // 4. Handle email delivery failure
    if (!emailResult.success) {
      const deliveryErrMsg = `Failed to deliver email: ${emailResult.error || 'SMTP delivery failure'}. Please try again later.`;
      console.error(`[Contact API] Delivery error: ${deliveryErrMsg}`);
      contact.emailDeliveryError = emailResult.error || 'SMTP delivery failure';
      await contact.save();

      return res.status(500).json({
        success: false,
        message: deliveryErrMsg,
        contactId: contact._id,
      });
    }

    // 5. Email successfully delivered
    contact.emailSent = true;
    contact.emailDeliveryError = '';
    await contact.save();

    console.log(`[Contact API] Contact email successfully delivered to administrator (${adminEmail})`);

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
      contactId: contact._id,
      emailSent: true,
      previewUrl: emailResult.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
};
