/**
 * VOLAMP Elektrikals Email Dispatch Service
 * Delivers secure, branded transactional emails for:
 * - Email Verification (Registration)
 * - Multi-Factor Authentication (MFA)
 * - Password Reset
 * 
 * Supports:
 * - Direct SMTP (Gmail, Corporate VOLAMP SMTP, Office 365, Brevo/SendGrid SMTP)
 * - Resend API (RESEND_API_KEY)
 * - Brevo REST API (BREVO_API_KEY)
 */

import { sendViaNativeSmtp } from "./smtpClient";

export interface EmailDispatchResult {
  success: boolean;
  channel: "smtp" | "resend" | "brevo" | "dev_logged";
  error?: string;
}

export async function dispatchOtpEmail(
  toEmail: string,
  code: string,
  purpose: "registration" | "mfa" | "password_reset"
): Promise<EmailDispatchResult> {
  const normalizedEmail = toEmail.toLowerCase().trim();

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

  // Plain-text version
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

  // Branded HTML version
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #102a40;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fb; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(16,42,64,0.08); border: 1px solid #e1e9f0;">
          
          <!-- Header Banner -->
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

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #102a40; margin: 0 0 12px 0;">
                ${purpose === "registration" ? "Confirm Your Registration" : purpose === "mfa" ? "Two-Step Security Verification" : "Reset Account Password"}
              </h1>
              
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                ${purposeDescription}
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #f0f7fd; border: 2px dashed #1d73b7; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #1d73b7; text-transform: uppercase; margin-bottom: 6px;">
                  Your One-Time Verification Code
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #102a40; padding: 6px 0;">
                  ${code}
                </div>
                <div style="font-size: 12px; color: #6e808b; margin-top: 6px;">
                  Valid for <strong>15 minutes</strong>
                </div>
              </div>

              <!-- Security Tips -->
              <div style="background-color: #fbfbfb; border-radius: 8px; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0 16px 0;">
                <p style="font-size: 12px; line-height: 1.5; color: #5a6b78; margin: 0;">
                  <strong>Security Reminder:</strong> VOLAMP Elektrikals personnel will never ask for your verification code. Never share this code with anyone.
                </p>
              </div>

              <p style="font-size: 13px; line-height: 1.5; color: #7f8f9c; margin: 24px 0 0 0;">
                If you did not initiate this request, no action is needed. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
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

  // 1. Check for Resend API Key
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM || "VOLAMP Elektrikals <onboarding@resend.dev>";
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [normalizedEmail],
          subject: title,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (resp.ok) {
        console.log(`[EMAIL DISPATCH] Successfully delivered via Resend API to ${normalizedEmail}`);
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
      const fromEmail = process.env.BREVO_FROM || "no-reply@volampelektrikals.com";
      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "VOLAMP Elektrikals", email: fromEmail },
          to: [{ email: normalizedEmail }],
          subject: title,
          htmlContent,
          textContent,
        }),
      });

      if (resp.ok) {
        console.log(`[EMAIL DISPATCH] Successfully delivered via Brevo API to ${normalizedEmail}`);
        return { success: true, channel: "brevo" };
      } else {
        const errText = await resp.text();
        console.error(`[EMAIL ERROR] Brevo API failed: ${errText}`);
      }
    } catch (err: any) {
      console.error(`[EMAIL ERROR] Brevo dispatch exception:`, err);
    }
  }

  // 3. Check for SMTP Configuration
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  // Strip whitespace from Google Workspace 16-character App Passwords (e.g., "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const smtpPass = rawPass?.replace(/\s+/g, "");
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser || "no-reply@volampelektrikals.com";

  const isPlaceholderPass = !smtpPass || smtpPass.includes("PASTE_YOUR_16_CHAR") || smtpPass === "YOUR_PASSWORD_HERE";

  if (smtpHost && smtpUser && smtpPass && !isPlaceholderPass) {
    try {
      console.log(`[SMTP DISPATCH] Sending from "${smtpFrom}" to "${normalizedEmail}" via ${smtpHost}:${smtpPort}...`);
      await sendViaNativeSmtp({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom,
        to: normalizedEmail,
        subject: title,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[SMTP DISPATCH] Successfully delivered OTP email from ${smtpFrom} to ${normalizedEmail}`);
      return { success: true, channel: "smtp" };
    } catch (err: any) {
      console.error(`[SMTP ERROR] Failed delivering from ${smtpFrom} to ${normalizedEmail}:`, err.message);
    }
  }

  // Fallback: Secure Server Console Log (when no SMTP credentials exist in .env)
  console.log(`\n============================================================`);
  console.log(`⚠️  [NO ACTIVE SMTP CONFIGURED IN .env]`);
  console.log(`To receive real emails in your inbox, set your SMTP credentials in .env:`);
  console.log(`   SMTP_HOST="smtp.gmail.com"  (or corporate host)`);
  console.log(`   SMTP_PORT=465`);
  console.log(`   SMTP_USER="your-email@gmail.com"`);
  console.log(`   SMTP_PASS="your-app-password"`);
  console.log(`   SMTP_FROM="your-email@gmail.com"`);
  console.log(`------------------------------------------------------------`);
  console.log(`Generated OTP for ${normalizedEmail}: [ ${code} ]`);
  console.log(`Subject: ${title}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`============================================================\n`);

  return { success: true, channel: "dev_logged" };
}
