/**
 * VOLAMP Elektrikals Email Dispatch Service
 * Delivers secure, branded transactional emails for:
 * - Email Verification & Authentication (OTP)
 * - Collaboration Proposals (collab@volampelektrikals.com)
 * - Grievance & Quality Disputes (Grievances@volampelektrikals.com)
 * - Press & Media Inquiries (pr@volampelektrikals.com)
 * 
 * Supports:
 * - Direct SMTP (Zoho Mail, Google Workspace, Corporate VOLAMP SMTP)
 * - Resend API (RESEND_API_KEY)
 * - Brevo REST API (BREVO_API_KEY)
 * - Console simulation fallback when no external SMTP credentials are provided
 */

import { sendViaNativeSmtp } from "./smtpClient";

export interface EmailDispatchResult {
  success: boolean;
  channel: "smtp" | "resend" | "brevo" | "dev_logged";
  error?: string;
}

export interface SendEmailOptions {
  to: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  category?: string;
}

/**
 * Core transactional email sender engine with multi-channel fallback
 */
export async function sendTransactionalEmail(options: SendEmailOptions): Promise<EmailDispatchResult> {
  const {
    to,
    from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@volampelektrikals.com",
    fromName = options.fromName || process.env.SMTP_FROM_NAME || "Volamp Elektrikals",
    replyTo,
    subject,
    html,
    text,
    category = "general",
  } = options;

  const normalizedTo = to.toLowerCase().trim();

  // 1. Check for Resend API Key
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM || `${fromName} <onboarding@resend.dev>`;
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [normalizedTo],
          reply_to: replyTo,
          subject,
          html,
          text,
        }),
      });

      if (resp.ok) {
        console.log(`[EMAIL DISPATCH] [${category.toUpperCase()}] Delivered via Resend API to ${normalizedTo}`);
        return { success: true, channel: "resend" };
      } else {
        const errText = await resp.text();
        console.error(`[EMAIL ERROR] Resend API failed: ${errText}`);
      }
    } catch (err: any) {
      console.error(`[EMAIL ERROR] Resend dispatch exception:`, err);
    }
  }

  // 2. Check for Brevo API Key
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const fromEmail = process.env.BREVO_FROM || from;
      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: normalizedTo }],
          replyTo: replyTo ? { email: replyTo } : undefined,
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      if (resp.ok) {
        console.log(`[EMAIL DISPATCH] [${category.toUpperCase()}] Delivered via Brevo API to ${normalizedTo}`);
        return { success: true, channel: "brevo" };
      } else {
        const errText = await resp.text();
        console.error(`[EMAIL ERROR] Brevo API failed: ${errText}`);
      }
    } catch (err: any) {
      console.error(`[EMAIL ERROR] Brevo dispatch exception:`, err);
    }
  }

  // 3. Native SMTP (Zoho Mail, Corporate Exchange, etc.)
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  const smtpPass = rawPass?.replace(/\s+/g, "");
  const smtpPort = Number(process.env.SMTP_PORT) || 465;

  const isPlaceholderPass =
    !smtpPass ||
    smtpPass.includes("PASTE_YOUR_") ||
    smtpPass.includes("16_CHAR") ||
    smtpPass === "YOUR_PASSWORD_HERE";

  if (smtpHost && smtpUser && smtpPass && !isPlaceholderPass) {
    const candidateHosts = [smtpHost];
    if (smtpHost.includes("zoho.in")) {
      candidateHosts.push(smtpHost.replace("zoho.in", "zoho.com"));
    } else if (smtpHost.includes("zoho.com")) {
      candidateHosts.push(smtpHost.replace("zoho.com", "zoho.in"));
    }

    for (const host of candidateHosts) {
      try {
        console.log(`[SMTP DISPATCH] [${category.toUpperCase()}] Dispatching from "${from}" to "${normalizedTo}" via ${host}:${smtpPort}...`);
        await sendViaNativeSmtp({
          host,
          port: smtpPort,
          secure: smtpPort === 465,
          user: smtpUser,
          pass: smtpPass,
          from,
          fromName,
          replyTo,
          envelopeFrom: smtpUser,
          to: normalizedTo,
          subject,
          text,
          html,
        });

        console.log(`[SMTP DISPATCH] [${category.toUpperCase()}] Delivered email from ${from} to ${normalizedTo} via ${host}`);
        return { success: true, channel: "smtp" };
      } catch (err: any) {
        console.error(`[SMTP ERROR] Attempt via ${host} failed:`, err.message);
      }
    }
  }

  // 4. Fallback: Detailed Server Console Log
  console.log(`\n============================================================`);
  console.log(`📧 [TRANSACTIONAL EMAIL DISPATCH LOG - ${category.toUpperCase()}]`);
  console.log(`To: ${normalizedTo}`);
  console.log(`From: "${fromName}" <${from}>`);
  if (replyTo) console.log(`Reply-To: ${replyTo}`);
  console.log(`Subject: ${subject}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`------------------------------------------------------------`);
  console.log(text);
  console.log(`============================================================\n`);

  return { success: true, channel: "dev_logged" };
}

// ---------------------------------------------------------------------------
// 1. OTP / Authentication Email Dispatch
// ---------------------------------------------------------------------------

export async function dispatchOtpEmail(
  toEmail: string,
  code: string,
  purpose: "registration" | "mfa" | "password_reset"
): Promise<EmailDispatchResult> {
  const title =
    purpose === "registration"
      ? "Verify Your Email Address - VOLAMP Elektrikals"
      : purpose === "mfa"
      ? "Two-Step Verification Code - VOLAMP Elektrikals"
      : "Password Reset Code - VOLAMP Elektrikals";

  const purposeDescription =
    purpose === "registration"
      ? "Thank you for creating an account with VOLAMP Elektrikals. Please use the verification code below to confirm your official email address."
      : purpose === "mfa"
      ? "A sign-in attempt was detected for your account. Please use the one-time code below to complete two-step authentication."
      : "We received a request to reset your VOLAMP account password. Enter the code below to set a new password.";

  const textContent = `
VOLAMP ELEKTRIKALS PVT. LTD.
${title}
--------------------------------------------------

Hello,

${purposeDescription}

YOUR 6-DIGIT VERIFICATION CODE:
==============================
       [ ${code} ]
==============================

This code is valid for 15 minutes. For your security, never share this code with anyone.

If you did not request this verification code, please disregard this email or notify our security team at support@volampelektrikals.com.

Regards,
VOLAMP Elektrikals Security & IT Administration
Vadodara, Gujarat, India
https://volampelektrikals.com
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #102a40;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fb; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(16,42,64,0.08); border: 1px solid #e1e9f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #1d73b7 100%); padding: 32px 30px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">
                VOLAMP <span style="color: #f59e0b;">ELEKTRIKALS</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #cbdbe7; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                Power & Energy Infrastructure Solutions
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #102a40; margin: 0 0 12px 0;">
                ${purpose === "registration" ? "Confirm Your Registration" : purpose === "mfa" ? "Two-Step Security Verification" : "Reset Account Password"}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                ${purposeDescription}
              </p>
              <div style="background-color: #f0f7fd; border: 2px dashed #1d73b7; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #1d73b7; text-transform: uppercase; margin-bottom: 6px;">
                  Your One-Time Verification Code
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #102a40; padding: 6px 0;">
                  ${code}
                </div>
                <div style="font-size: 12px; color: #6e808b; margin-top: 6px;">
                  Valid for <strong>15 minutes</strong>
                </div>
              </div>
              <div style="background-color: #fbfbfb; border-radius: 8px; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0 16px 0;">
                <p style="font-size: 12px; line-height: 1.5; color: #5a6b78; margin: 0;">
                  <strong>Security Reminder:</strong> VOLAMP Elektrikals personnel will never ask for your verification code. Never share this code with anyone.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #eef2f6; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #8e9da9; margin: 0 0 6px 0;">
                &copy; ${new Date().getFullYear()} VOLAMP Elektrikals Pvt. Ltd. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #8e9da9; margin: 0;">
                Vadodara, Gujarat, India &bull; <a href="https://volampelektrikals.com" style="color: #1d73b7; text-decoration: none;">volampelektrikals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return sendTransactionalEmail({
    to: toEmail,
    subject: title,
    html: htmlContent,
    text: textContent,
    category: "otp",
  });
}

// ---------------------------------------------------------------------------
// 2. Collaboration Proposal Workflow (collab@volampelektrikals.com)
// ---------------------------------------------------------------------------

export interface CollaborationSubmissionData {
  applicationId: string;
  companyName: string;
  contactName: string;
  designation: string;
  businessType: string;
  collaborationTypes: string[];
  opportunityDetails: string;
  partnershipStrengths: string[];
  expectedBusinessPotential: string;
  expectedTimeline: string;
  mobile: string;
  email: string;
  cityCountry: string;
  notes?: string | null;
}

export async function dispatchCollaborationEmails(data: CollaborationSubmissionData): Promise<{
  internalDrop: EmailDispatchResult;
  userConfirmation: EmailDispatchResult;
}> {
  const collabInbox = "collab@volampelektrikals.com";
  const formattedTypes = data.collaborationTypes.join(", ");
  const formattedStrengths = data.partnershipStrengths.join(", ");

  // 2A. Internal Drop to collab@volampelektrikals.com
  const internalSubject = `[NEW COLLABORATION TICKET #${data.applicationId}] ${data.companyName} - ${data.contactName}`;

  const internalText = `
VOLAMP ELEKTRIKALS PVT. LTD. - STRATEGIC COLLABORATION INBOX
============================================================
NEW PARTNERSHIP PROPOSAL LOGGED: TICKET #${data.applicationId}
============================================================

APPLICANT & ORGANIZATION:
- Organization Name: ${data.companyName}
- Contact Person: ${data.contactName} (${data.designation})
- Business Entity: ${data.businessType}
- Territory / Location: ${data.cityCountry}

CONTACT INFORMATION:
- Work Email: ${data.email}
- Mobile / WhatsApp: ${data.mobile}

PROPOSAL SPECIFICS:
- Area of Collaboration: ${formattedTypes}
- Expected Business Potential: ${data.expectedBusinessPotential}
- Target Timeline: ${data.expectedTimeline}
- Core Capabilities / Strengths: ${formattedStrengths}

OPPORTUNITY DETAILS:
${data.opportunityDetails}

ADDITIONAL NOTES:
${data.notes || "None provided"}

------------------------------------------------------------
Application Timestamp: ${new Date().toISOString()}
Volamp Executive Leadership Dispatch Desk
`.trim();

  const internalHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${internalSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #0d4b75 100%); padding: 24px 30px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #f59e0b;">NEW PARTNERSHIP DOSSIER</span>
              <h1 style="font-size: 22px; font-weight: 800; margin: 6px 0 0 0; color: #ffffff;">Ticket #${data.applicationId}</h1>
              <p style="font-size: 13px; color: #cbdbe7; margin: 4px 0 0 0;">Received from ${data.companyName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px;">
              <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096; width: 35%;">Organization</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #102a40;">${data.companyName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Contact Person</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;"><strong>${data.contactName}</strong> (${data.designation})</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Business Type</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.businessType}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Email Address</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #1d73b7;"><a href="mailto:${data.email}" style="color: #1d73b7;">${data.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Mobile / WhatsApp</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;"><a href="tel:${data.mobile}" style="color: #2d3748;">${data.mobile}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Location / City</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.cityCountry}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Collaboration Focus</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748; font-weight: 600;">${formattedTypes}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Business Potential</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #047857; font-weight: 700;">${data.expectedBusinessPotential}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Target Timeline</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.expectedTimeline}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Capabilities / Assets</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${formattedStrengths}</td>
                </tr>
              </table>

              <div style="background-color: #f7fafc; border-left: 4px solid #1d73b7; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1d73b7; margin-bottom: 6px;">Opportunity Details</div>
                <div style="font-size: 13px; line-height: 1.6; color: #2d3748; white-space: pre-wrap;">${data.opportunityDetails}</div>
              </div>

              ${data.notes ? `
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 18px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #b45309; margin-bottom: 4px;">Additional Notes</div>
                <div style="font-size: 13px; line-height: 1.5; color: #78350f; white-space: pre-wrap;">${data.notes}</div>
              </div>` : ""}

              <div style="padding-top: 10px; display: flex; gap: 10px;">
                <a href="mailto:${data.email}?subject=Regarding%20Volamp%20Collaboration%20Ticket%20${data.applicationId}" style="display: inline-block; background-color: #102a40; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 700;">Reply to ${data.contactName}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 16px 30px; text-align: center; font-size: 11px; color: #a0aec0;">
              VOLAMP Executive Collaboration Desk &bull; System Generated Dispatch
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // 2B. User Ticket Confirmation from collab@volampelektrikals.com to data.email
  const userSubject = `[TICKET #${data.applicationId}] Collaboration Proposal Received - Volamp Elektrikals`;

  const userText = `
VOLAMP ELEKTRIKALS PVT. LTD.
STRATEGIC PARTNERSHIP & COLLABORATION DESK
------------------------------------------------------------
OFFICIAL TICKET REFERENCE: [ ${data.applicationId} ]
------------------------------------------------------------

Dear ${data.contactName},

Thank you for your interest in collaborating with VOLAMP Elektrikals Pvt. Ltd.

We have successfully received your strategic proposal on behalf of "${data.companyName}". Your application has been logged under official Ticket Reference Number:

============================================================
              TICKET ID: ${data.applicationId}
============================================================

SUMMARY OF YOUR PROPOSAL:
- Organization: ${data.companyName}
- Collaboration Focus: ${formattedTypes}
- Expected Business Potential: ${data.expectedBusinessPotential}
- Target Timeline: ${data.expectedTimeline}
- Location: ${data.cityCountry}

NEXT STEPS & TIMELINE:
1. Dossier Review (Within 24-48 business hours):
   Our Executive Leadership & Business Development Desk will evaluate your proposal against our current pan-India regional expansion roadmap.

2. Discovery Discussion & NDA:
   If aligned with our growth mandate, our corporate development team will schedule a direct alignment call to discuss commercial and operational parameters.

NEED ASSISTANCE OR HAVE UPDATES?
To provide supplementary presentations or company decks, simply reply directly to this email or write to collab@volampelektrikals.com quoting your Ticket ID ${data.applicationId}.

Warm regards,

Volamp Collaboration & Strategic Alliances Desk
VOLAMP Elektrikals Pvt. Ltd.
Vadodara, Gujarat, India
Web: https://volampelektrikals.com
Direct: collab@volampelektrikals.com
Phone: +91 95123 65582
`.trim();

  const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${userSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #1d73b7 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                VOLAMP <span style="color: #f59e0b;">ELEKTRIKALS</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #cbdbe7; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                Strategic Partnerships & Business Development
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
                &bull; Proposal Successfully Logged
              </span>
              <h1 style="font-size: 20px; font-weight: 800; color: #102a40; margin: 0 0 12px 0;">
                Thank You, ${data.contactName}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                We have registered your strategic collaboration proposal on behalf of <strong>${data.companyName}</strong>. Our executive leadership desk will review your submission promptly.
              </p>

              <!-- Ticket Box -->
              <div style="background-color: #faf5ee; border: 2px dashed #d97706; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #b45309; text-transform: uppercase; margin-bottom: 6px;">
                  Official Collaboration Ticket Reference
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #102a40; padding: 4px 0;">
                  ${data.applicationId}
                </div>
                <div style="font-size: 12px; color: #78350f; margin-top: 6px;">
                  Please quote this Ticket ID in all subsequent communications.
                </div>
              </div>

              <!-- Proposal Summary Table -->
              <div style="background-color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <div style="font-size: 12px; font-weight: 700; color: #102a40; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                  Proposal Overview
                </div>
                <table width="100%" style="font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 45%;">Focus Area:</td>
                    <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${formattedTypes}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Target Timeline:</td>
                    <td style="padding: 5px 0; color: #1e293b;">${data.expectedTimeline}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Projected Volume:</td>
                    <td style="padding: 5px 0; color: #047857; font-weight: 700;">${data.expectedBusinessPotential}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Territory:</td>
                    <td style="padding: 5px 0; color: #1e293b;">${data.cityCountry}</td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps -->
              <div style="margin: 24px 0;">
                <h3 style="font-size: 14px; font-weight: 700; color: #102a40; margin: 0 0 10px 0;">Next Steps:</h3>
                <ol style="font-size: 13px; line-height: 1.6; color: #4b5d6e; padding-left: 20px; margin: 0;">
                  <li style="margin-bottom: 8px;"><strong>Review (24-48 Business Hours):</strong> Our leadership team assesses mutual strategic alignment and regional synergy.</li>
                  <li style="margin-bottom: 8px;"><strong>Executive Alignment Call:</strong> Our partnerships lead will reach out to schedule a formal discussion and share NDA documentation.</li>
                </ol>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Have questions or need to send pitch presentations? Simply reply directly to this email or reach us at <a href="mailto:collab@volampelektrikals.com" style="color: #1d73b7; font-weight: 600;">collab@volampelektrikals.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #8e9da9; margin: 0 0 6px 0;">
                &copy; ${new Date().getFullYear()} VOLAMP Elektrikals Pvt. Ltd. &bull; Pan-India Distribution & Infrastructure Solutions
              </p>
              <p style="font-size: 11px; color: #8e9da9; margin: 0;">
                Vadodara, Gujarat, India &bull; <a href="https://volampelektrikals.com" style="color: #1d73b7; text-decoration: none;">volampelektrikals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const defaultSender = process.env.SMTP_FROM || "no-reply@volampelektrikals.com";

  // Execute dispatches in parallel
  const [internalDrop, userConfirmation] = await Promise.all([
    sendTransactionalEmail({
      to: collabInbox,
      from: defaultSender,
      fromName: "VOLAMP Collaboration Desk",
      replyTo: data.email,
      subject: internalSubject,
      text: internalText,
      html: internalHtml,
      category: "collaboration_internal",
    }),
    sendTransactionalEmail({
      to: data.email,
      from: defaultSender,
      fromName: "VOLAMP Collaboration Desk",
      replyTo: collabInbox,
      subject: userSubject,
      text: userText,
      html: userHtml,
      category: "collaboration_user_ticket",
    }),
  ]);

  return { internalDrop, userConfirmation };
}

// ---------------------------------------------------------------------------
// 3. Grievance / Complaints Workflow (Grievances@volampelektrikals.com)
// ---------------------------------------------------------------------------

export interface GrievanceSubmissionData {
  caseId: string;
  fullName: string;
  companyName?: string | null;
  email: string;
  phone: string;
  caseType: string;
  orderRef?: string | null;
  urgency: string;
  details: string;
}

export async function dispatchGrievanceEmails(data: GrievanceSubmissionData): Promise<{
  internalDrop: EmailDispatchResult;
  userConfirmation: EmailDispatchResult;
}> {
  const grievanceInbox = "Grievances@volampelektrikals.com";

  // 3A. Internal Drop to Grievances@volampelektrikals.com
  const internalSubject = `[GRIEVANCE CASE #${data.caseId}] [${data.urgency.toUpperCase()}] ${data.caseType} - ${data.fullName}`;

  const internalText = `
VOLAMP ELEKTRIKALS PVT. LTD. - OFFICIAL GRIEVANCE & RESOLUTION CELL
==================================================================
NEW FORMAL DISPUTE REGISTERED: CASE #${data.caseId}
==================================================================

COMPLAINANT INFORMATION:
- Contact Name: ${data.fullName}
- Company / Contractor Entity: ${data.companyName || "Not specified"}
- Email Address: ${data.email}
- Contact Phone: ${data.phone}

CASE SPECIFICATIONS:
- Discrepancy Nature: ${data.caseType}
- Order / Invoice / LR Ref: ${data.orderRef || "Not provided"}
- Project Urgency: ${data.urgency.toUpperCase()}

DISCREPANCY DETAILS:
${data.details}

------------------------------------------------------------------
Registered At: ${new Date().toISOString()}
Volamp Senior Grievance & Technical Dispatch Desk
Vadodara, Gujarat, India
`.trim();

  const internalHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${internalSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #4d1217 0%, #7f1d1d 100%); padding: 24px 30px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #fbbf24;">GRIEVANCE & QUALITY ESCALATION CELL</span>
              <h1 style="font-size: 22px; font-weight: 800; margin: 6px 0 0 0; color: #ffffff;">Case #${data.caseId}</h1>
              <p style="font-size: 13px; color: #fecaca; margin: 4px 0 0 0;">Priority: ${data.urgency.toUpperCase()} &bull; Type: ${data.caseType}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px;">
              <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096; width: 35%;">Complainant</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #4d1217;">${data.fullName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Company Entity</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.companyName || "N/A"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Email Address</td>
                  <td style="padding: 8px 0; font-size: 13px;"><a href="mailto:${data.email}" style="color: #1d73b7;">${data.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Phone / WhatsApp</td>
                  <td style="padding: 8px 0; font-size: 13px;"><a href="tel:${data.phone}" style="color: #2d3748;">${data.phone}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Order / LR Number</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #b45309;">${data.orderRef || "Not provided"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Urgency Level</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: ${data.urgency.toLowerCase() === 'critical' ? '#dc2626' : '#d97706'};">${data.urgency.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Discrepancy Category</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.caseType}</td>
                </tr>
              </table>

              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #b91c1c; margin-bottom: 6px;">Discrepancy Description</div>
                <div style="font-size: 13px; line-height: 1.6; color: #450a0a; white-space: pre-wrap;">${data.details}</div>
              </div>

              <div style="padding-top: 10px;">
                <a href="mailto:${data.email}?subject=Regarding%20Volamp%20Grievance%20Case%20${data.caseId}" style="display: inline-block; background-color: #4d1217; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 700;">Reply to Complainant</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 16px 30px; text-align: center; font-size: 11px; color: #a0aec0;">
              VOLAMP Senior Quality & Grievance Cell &bull; System Generated Dispatch
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // 3B. User Ticket Confirmation from Grievances@volampelektrikals.com to data.email
  const userSubject = `[CASE #${data.caseId}] Formal Grievance & Quality Ticket Logged - Volamp Elektrikals`;

  const userText = `
VOLAMP ELEKTRIKALS PVT. LTD.
OFFICIAL GRIEVANCE & RESOLUTION CELL
------------------------------------------------------------
OFFICIAL CASE TICKET: [ ${data.caseId} ]
------------------------------------------------------------

Dear ${data.fullName},

We acknowledge receipt of your formal discrepancy notice regarding:
Category: ${data.caseType}
Order / Invoice Ref: ${data.orderRef || "N/A"}
Urgency: ${data.urgency.toUpperCase()}

Your complaint has been assigned to our Senior Grievance & Quality Dispatch Cell under official Case Reference:

============================================================
              CASE ID: ${data.caseId}
============================================================

STRICT SERVICE LEVEL AGREEMENT (SLA) COMMITMENTS:
- 24-Hour SLA: Official Case Acknowledgment & Technical Dossier Assigned.
- 48-Hour SLA: Factory Batch Test MTC & Transporter LR Audit.
- 72-Hour SLA: Formal Resolution (Expedited drum replacement or commercial credit note).

PROVIDING SUPPORTING PHOTOS OR DOCUMENTS:
If you have photographs of damaged cable drums, discrepancy reports, or delivery challan (LR) copies, please reply directly to this email or send them to:
Email: Grievances@volampelektrikals.com
WhatsApp Helpline: +91 95123 65582
Always quote Case ID "${data.caseId}" in the subject line.

Sincerely,

Grievance Officer
VOLAMP Elektrikals Pvt. Ltd.
Vadodara, Gujarat, India
Direct: Grievances@volampelektrikals.com
Phone: +91 95123 65582
Web: https://volampelektrikals.com
`.trim();

  const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${userSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #4d1217 0%, #7f1d1d 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                VOLAMP <span style="color: #fbbf24;">ELEKTRIKALS</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #fecaca; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                Official Grievance & Technical Dispute Resolution Cell
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
                &bull; Case Formally Registered
              </span>
              <h1 style="font-size: 20px; font-weight: 800; color: #4d1217; margin: 0 0 12px 0;">
                Case Ticket Registered, ${data.fullName}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                We have registered your issue regarding <strong>${data.caseType}</strong>. Our senior technical dispatch and quality control unit is investigating this matter.
              </p>

              <!-- Ticket Box -->
              <div style="background-color: #fff7ed; border: 2px dashed #ea580c; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #c2410c; text-transform: uppercase; margin-bottom: 6px;">
                  Official Case Reference Number
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #4d1217; padding: 4px 0;">
                  ${data.caseId}
                </div>
                <div style="font-size: 12px; color: #9a3412; margin-top: 6px;">
                  Please quote this Case ID when communicating with our transport desk or sharing photographs.
                </div>
              </div>

              <!-- SLA Badges -->
              <div style="background-color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <div style="font-size: 12px; font-weight: 700; color: #102a40; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                  Strict Resolution SLAs
                </div>
                <table width="100%" style="font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 35%;"><strong>24-Hour SLA:</strong></td>
                    <td style="padding: 6px 0; color: #1e293b;">Official Case Acknowledgment & Dossier Assigned</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>48-Hour SLA:</strong></td>
                    <td style="padding: 6px 0; color: #1e293b;">MTC, Transporter LR & Factory Batch Audit</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>72-Hour SLA:</strong></td>
                    <td style="padding: 6px 0; color: #047857; font-weight: 700;">Replacement Dispatch or Commercial Credit Note</td>
                  </tr>
                </table>
              </div>

              <!-- Photos submission note -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin: 20px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 4px;">Share Photos / Evidence:</div>
                <p style="font-size: 12px; line-height: 1.5; color: #14532d; margin: 0;">
                  Reply directly to this email or send photos of damaged reels, test reports, or LR slips to <a href="mailto:Grievances@volampelektrikals.com" style="color: #166534; font-weight: 700;">Grievances@volampelektrikals.com</a> or WhatsApp <strong>+91 95123 65582</strong>.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #8e9da9; margin: 0 0 6px 0;">
                &copy; ${new Date().getFullYear()} VOLAMP Elektrikals Pvt. Ltd. &bull; Official Grievance Cell
              </p>
              <p style="font-size: 11px; color: #8e9da9; margin: 0;">
                Vadodara, Gujarat, India &bull; <a href="https://volampelektrikals.com" style="color: #4d1217; text-decoration: none;">volampelektrikals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const defaultSender = process.env.SMTP_FROM || "no-reply@volampelektrikals.com";

  const [internalDrop, userConfirmation] = await Promise.all([
    sendTransactionalEmail({
      to: grievanceInbox,
      from: defaultSender,
      fromName: "VOLAMP Grievance Dispatch",
      replyTo: data.email,
      subject: internalSubject,
      text: internalText,
      html: internalHtml,
      category: "grievance_internal",
    }),
    sendTransactionalEmail({
      to: data.email,
      from: defaultSender,
      fromName: "VOLAMP Grievance & Quality Desk",
      replyTo: grievanceInbox,
      subject: userSubject,
      text: userText,
      html: userHtml,
      category: "grievance_user_ticket",
    }),
  ]);

  return { internalDrop, userConfirmation };
}

// ---------------------------------------------------------------------------
// 4. Press & Media Relations Workflow (pr@volampelektrikals.com)
// ---------------------------------------------------------------------------

export interface PressInquiryData {
  pressTicketId: string;
  journalistName: string;
  mediaOutlet: string;
  email: string;
  phone: string;
  inquiryType: string;
  deadline: string;
  details: string;
}

export async function dispatchPressEmails(data: PressInquiryData): Promise<{
  internalDrop: EmailDispatchResult;
  userConfirmation: EmailDispatchResult;
}> {
  const prInbox = "pr@volampelektrikals.com";

  // 4A. Internal Drop to pr@volampelektrikals.com
  const internalSubject = `[PRESS INQUIRY #${data.pressTicketId}] [DEADLINE: ${data.deadline}] ${data.mediaOutlet} - ${data.journalistName}`;

  const internalText = `
VOLAMP ELEKTRIKALS PVT. LTD. - CORPORATE MEDIA & PR DESK
=========================================================
NEW MEDIA INQUIRY LOGGED: TICKET #${data.pressTicketId}
=========================================================

JOURNALIST / MEDIA REPRESENTATIVE:
- Name: ${data.journalistName}
- Publication / Outlet: ${data.mediaOutlet}
- Work Email: ${data.email}
- Phone / WhatsApp: ${data.phone}

INQUIRY PARAMETERS:
- Focus / Topic: ${data.inquiryType}
- Editorial Deadline: ${data.deadline}

QUESTIONS / STORY BRIEF:
${data.details}

---------------------------------------------------------
Received At: ${new Date().toISOString()}
Volamp Corporate Communications & PR Desk
`.trim();

  const internalHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${internalSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #1e3a5f 100%); padding: 24px 30px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #f59e0b;">CORPORATE MEDIA & PR DESK</span>
              <h1 style="font-size: 22px; font-weight: 800; margin: 6px 0 0 0; color: #ffffff;">Press Ticket #${data.pressTicketId}</h1>
              <p style="font-size: 13px; color: #cbdbe7; margin: 4px 0 0 0;">Publication: ${data.mediaOutlet} &bull; Deadline: ${data.deadline}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px;">
              <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096; width: 35%;">Journalist Name</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #102a40;">${data.journalistName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Media Publication</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.mediaOutlet}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Work Email</td>
                  <td style="padding: 8px 0; font-size: 13px;"><a href="mailto:${data.email}" style="color: #1d73b7;">${data.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Phone / WhatsApp</td>
                  <td style="padding: 8px 0; font-size: 13px;"><a href="tel:${data.phone}" style="color: #2d3748;">${data.phone}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Topic / Focus</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.inquiryType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Editorial Deadline</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #dc2626;">${data.deadline}</td>
                </tr>
              </table>

              <div style="background-color: #f7fafc; border-left: 4px solid #1d73b7; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1d73b7; margin-bottom: 6px;">Inquiry Questions / Context</div>
                <div style="font-size: 13px; line-height: 1.6; color: #2d3748; white-space: pre-wrap;">${data.details}</div>
              </div>

              <div style="padding-top: 10px;">
                <a href="mailto:${data.email}?subject=Response%20to%20Volamp%20Media%20Inquiry%20${data.pressTicketId}" style="display: inline-block; background-color: #102a40; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 700;">Reply to Journalist</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 16px 30px; text-align: center; font-size: 11px; color: #a0aec0;">
              VOLAMP Corporate Communications Desk &bull; System Generated Dispatch
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // 4B. User Ticket Confirmation from pr@volampelektrikals.com to data.email
  const userSubject = `[PRESS TICKET #${data.pressTicketId}] Media Inquiry Logged - Volamp Corporate PR Desk`;

  const userText = `
VOLAMP ELEKTRIKALS PVT. LTD.
CORPORATE COMMUNICATIONS & PRESS RELATIONS DESK
------------------------------------------------------------
MEDIA TICKET REFERENCE: [ ${data.pressTicketId} ]
------------------------------------------------------------

Dear ${data.journalistName},

Thank you for contacting the corporate communications office of VOLAMP Elektrikals Pvt. Ltd. on behalf of "${data.mediaOutlet}".

Your media inquiry has been logged under official Press Reference:

============================================================
              PRESS TICKET ID: ${data.pressTicketId}
============================================================

INQUIRY OVERVIEW:
- Publication / Media Outlet: ${data.mediaOutlet}
- Topic: ${data.inquiryType}
- Stated Deadline: ${data.deadline}

EDITORIAL RESPONSE PROCESS:
Our corporate communications officer has been notified. We prioritize press deadlines and typically respond with verified statements, spokesperson commentary, or requested assets within your editorial timeframe.

DIRECT MEDIA LIAISON:
Email: pr@volampelektrikals.com
Media Helpline: +91 95123 65582
Website: https://volampelektrikals.com

Best regards,

Corporate Communications & Media Desk
VOLAMP Elektrikals Pvt. Ltd.
Vadodara, Gujarat, India
`.trim();

  const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${userSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #1e3a5f 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                VOLAMP <span style="color: #f59e0b;">ELEKTRIKALS</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #cbdbe7; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                Corporate Communications & Media Relations Desk
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
                &bull; Media Inquiry Assigned
              </span>
              <h1 style="font-size: 20px; font-weight: 800; color: #102a40; margin: 0 0 12px 0;">
                Inquiry Logged, ${data.journalistName}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                We have registered your media inquiry for <strong>${data.mediaOutlet}</strong>. Our corporate communications lead has received your brief and stated deadline.
              </p>

              <!-- Ticket Box -->
              <div style="background-color: #f0f7fd; border: 2px dashed #1d73b7; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #1d73b7; text-transform: uppercase; margin-bottom: 6px;">
                  Official Press Ticket Reference
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #102a40; padding: 4px 0;">
                  ${data.pressTicketId}
                </div>
                <div style="font-size: 12px; color: #6e808b; margin-top: 6px;">
                  Please quote this Press Ticket ID for expedited follow-up.
                </div>
              </div>

              <div style="background-color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <table width="100%" style="font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 45%;">Topic:</td>
                    <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${data.inquiryType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Editorial Deadline:</td>
                    <td style="padding: 5px 0; color: #dc2626; font-weight: 700;">${data.deadline}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Direct inquiries or time-sensitive deadline requests can also be directed to <a href="mailto:pr@volampelektrikals.com" style="color: #1d73b7; font-weight: 600;">pr@volampelektrikals.com</a> or phone <strong>+91 95123 65582</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #8e9da9; margin: 0 0 6px 0;">
                &copy; ${new Date().getFullYear()} VOLAMP Elektrikals Pvt. Ltd. &bull; Corporate Media & PR Desk
              </p>
              <p style="font-size: 11px; color: #8e9da9; margin: 0;">
                Vadodara, Gujarat, India &bull; <a href="https://volampelektrikals.com" style="color: #1d73b7; text-decoration: none;">volampelektrikals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const defaultSender = process.env.SMTP_FROM || "no-reply@volampelektrikals.com";

  const [internalDrop, userConfirmation] = await Promise.all([
    sendTransactionalEmail({
      to: prInbox,
      from: defaultSender,
      fromName: "VOLAMP Press Desk",
      replyTo: data.email,
      subject: internalSubject,
      text: internalText,
      html: internalHtml,
      category: "press_internal",
    }),
    sendTransactionalEmail({
      to: data.email,
      from: defaultSender,
      fromName: "VOLAMP Corporate PR Desk",
      replyTo: prInbox,
      subject: userSubject,
      text: userText,
      html: userHtml,
      category: "press_user_ticket",
    }),
  ]);

  return { internalDrop, userConfirmation };
}
