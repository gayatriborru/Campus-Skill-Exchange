const nodemailer = require('nodemailer');

/**
 * Creates and configures a Nodemailer transporter using environment variables.
 * Never hardcodes credentials.
 */
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  // Local development / testing fallback: Create an ephemeral Ethereal test transporter
  // so real email payloads are verified and testable without requiring private production credentials.
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('[Email Service] Using ephemeral test SMTP account for development:', testAccount.user);
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('[Email Service] Could not initialize test SMTP transporter:', err.message);
    return null;
  }
};

/**
 * Sends a session request notification email to the receiver.
 *
 * @param {Object} params
 * @param {string} params.receiverEmail - Recipient email retrieved directly from MongoDB
 * @param {string} params.receiverName - Receiver full name
 * @param {string} params.requesterName - Requester full name
 * @param {string} params.skillName - Skill name
 * @param {string} params.dateTime - Formatted session date and time
 * @param {string} params.message - Request notes or message
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, previewUrl?: string }>}
 */
const sendSessionRequestEmail = async ({
  receiverEmail,
  receiverName,
  requesterName,
  skillName,
  dateTime,
  message,
}) => {
  try {
    if (!receiverEmail) {
      const err = new Error('No receiver email address provided.');
      console.error('[Email Service] Error:', err.message);
      return { success: false, error: err.message };
    }

    const transporter = await getTransporter();
    if (!transporter) {
      console.warn('[Email Service] No SMTP transporter available. Email skipped.');
      return { success: false, error: 'SMTP transporter not configured.' };
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      (process.env.SMTP_USER
        ? `"Campus Skill Exchange" <${process.env.SMTP_USER}>`
        : '"Campus Skill Exchange" <no-reply@campus-skill-exchange.edu>');

    const subject = `New Session Request from ${requesterName}`;

    // Plain text body matching the exact requirement specification
    const textBody = `Hello ${receiverName},

You have received a new session request from ${requesterName}.

Skill: ${skillName}
Requested Date/Time: ${dateTime}
Message: ${message || 'Skill exchange session requested via SkillVerse.'}

Please log in to the Campus Peer-to-Peer Knowledge Sharing Platform to view and respond to the request.

Thank you.`;

    // Modern HTML body matching collegiate dark branding
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Campus Peer-to-Peer Knowledge Sharing Platform</h1>
          <p style="margin: 6px 0 0; color: #e0e7ff; font-size: 13px;">Mutual Skill Exchange & Learning</p>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 15px; margin: 0 0 16px; color: #f1f5f9;">Hello <strong>${receiverName}</strong>,</p>
          <p style="font-size: 14px; margin: 0 0 20px; color: #cbd5e1; line-height: 1.6;">
            You have received a new session request from <strong style="color: #67e8f9;">${requesterName}</strong>.
          </p>
          <div style="background: #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #334155;">
            <p style="margin: 0 0 10px; font-size: 13px; color: #94a3b8;"><strong style="color: #f1f5f9;">Skill:</strong> <span style="color: #818cf8; font-weight: 600;">${skillName}</span></p>
            <p style="margin: 0 0 10px; font-size: 13px; color: #94a3b8;"><strong style="color: #f1f5f9;">Requested Date/Time:</strong> ${dateTime}</p>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;"><strong style="color: #f1f5f9;">Message:</strong> "${message || 'Skill exchange session requested via SkillVerse.'}"</p>
          </div>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 24px;">
            Please log in to the Campus Peer-to-Peer Knowledge Sharing Platform to view and respond to the request.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/sessions" style="background: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; display: inline-block;">
              View & Respond to Request
            </a>
          </div>
          <p style="font-size: 13px; color: #cbd5e1; margin: 24px 0 0;">Thank you.</p>
        </div>
        <div style="background: #090d16; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
          Campus Peer-to-Peer Knowledge Sharing Platform • Zero Money, Infinite Growth.
        </div>
      </div>
    `;

    console.log(`[Email Service] Attempting to send session request email to ${receiverEmail} (${receiverName}) from ${requesterName}...`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to: receiverEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[Email Service] Email sent successfully to ${receiverEmail}! Message ID: ${info.messageId}`);

    let previewUrl = null;
    try {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Service] Test Message Preview URL: ${previewUrl}`);
      }
    } catch {
      // Ignored for production SMTP
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${receiverEmail}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendSessionRequestEmail,
};
