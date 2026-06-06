import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Send password reset email ─────────────────────────────────────────────────
export const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
        from:    "eBook Creator <onboarding@resend.dev>",
        to:      toEmail,
        subject: "Reset Your Password — eBook Creator",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Reset Your Password</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hi ${userName},</p>
              <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.6;">
                We received a request to reset your password for your eBook Creator account.
                Click the button below to set a new password.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}"
                   style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color:#6b7280;font-size:13px;margin:24px 0 0;line-height:1.6;">
                This link expires in <strong>15 minutes</strong>. If you didn't request a password reset,
                you can safely ignore this email — your password won't change.
              </p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                If the button doesn't work, copy and paste this link:<br>
                <a href="${resetUrl}" style="color:#7c3aed;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">© 2025 eBook Creator. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
};
