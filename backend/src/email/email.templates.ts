export const emailTemplates = {
 REGISTER_OTP: {
  subject: "Verify your email – Mel-DemandScraper",
  html: `
  <div style="margin:0;padding:0;background:#f4f7ff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f4f7ff;margin:0;padding:34px 12px;font-family:Inter,Arial,sans-serif;">
      <tr>
        <td align="center">

          <table width="640" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:640px;width:100%;
                   background:#ffffff;border-radius:22px;overflow:hidden;
                   border:1px solid #e5e7eb;
                   box-shadow:0 22px 60px rgba(15,23,42,.12);">

            <!-- Gradient strip -->
            <tr>
              <td style="height:8px;background:linear-gradient(90deg,#38bdf8,#6366f1,#22d3ee);"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:30px 28px 10px;">

                <img
                  src="https://mel-demandscraper.com/logo.png"
                  alt="Mel-DemandScraper"
                  width="240"
                  style="width:240px;max-width:240px;height:auto;display:block;border:0;"
                />

                <div style="margin-top:16px;display:inline-block;
                            background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;
                            padding:6px 12px;border-radius:999px;
                            font-size:12px;font-weight:700;">
                  Email verification
                </div>

                <h1 style="margin:16px 0 6px;font-size:26px;line-height:1.25;color:#0f172a;">
                  Verify your email
                </h1>

                <p style="margin:0;max-width:520px;font-size:14px;line-height:1.75;color:#475569;">
                  Use the verification code below to confirm your email address and
                  activate your <b style="color:#0f172a;">Mel-DemandScraper</b> account.
                </p>

              </td>
            </tr>

            <!-- OTP Card -->
            <tr>
              <td align="center" style="padding:22px 28px;">
                <div style="background:#f8fafc;border:1px solid #e5e7eb;
                            border-radius:18px;padding:22px 28px;
                            font-size:34px;letter-spacing:6px;
                            font-weight:800;color:#0f172a;">
                  {{otp}}
                </div>

                <div style="margin-top:12px;font-size:12px;color:#64748b;">
                  This code is valid for <b style="color:#0f172a;">{{expiresIn}} minutes</b>
                </div>
              </td>
            </tr>

            <!-- Security note -->
            <tr>
              <td align="center" style="padding:0 28px 22px;">
                <div style="font-size:12px;line-height:1.6;color:#64748b;max-width:520px;">
                  If you didn’t create an account, you can safely ignore this email.
                  For security reasons, never share this code with anyone.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding:18px 22px;text-align:center;">
                <div style="font-size:12px;color:#94a3b8;">
                  © {{year}} Mel-DemandScraper • All rights reserved
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `
},

LOGIN_OTP: {
  subject: "Your login verification code – Mel-DemandScraper",
  html: `
  <div style="margin:0;padding:0;background:#f4f7ff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f4f7ff;margin:0;padding:34px 12px;font-family:Inter,Arial,sans-serif;">
      <tr>
        <td align="center">

          <table width="640" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:640px;width:100%;
                   background:#ffffff;border-radius:22px;overflow:hidden;
                   border:1px solid #e5e7eb;
                   box-shadow:0 22px 60px rgba(15,23,42,.12);">

            <!-- Gradient strip -->
            <tr>
              <td style="height:8px;background:linear-gradient(90deg,#38bdf8,#6366f1,#22d3ee);"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:30px 28px 10px;">

                <img
                  src="https://mel-demandscraper.com/logo.png"
                  alt="Mel-DemandScraper"
                  width="240"
                  style="width:240px;max-width:240px;height:auto;display:block;border:0;"
                />

                <div style="margin-top:16px;display:inline-block;
                            background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;
                            padding:6px 12px;border-radius:999px;
                            font-size:12px;font-weight:700;">
                  Secure login
                </div>

                <h1 style="margin:16px 0 6px;font-size:26px;line-height:1.25;color:#0f172a;">
                  Login verification
                </h1>

                <p style="margin:0;max-width:520px;font-size:14px;line-height:1.75;color:#475569;">
                  We detected a login attempt on your account.
                  Enter the code below to securely sign in.
                </p>

              </td>
            </tr>

            <!-- OTP Card -->
            <tr>
              <td align="center" style="padding:22px 28px;">
                <div style="background:#f8fafc;border:1px solid #e5e7eb;
                            border-radius:18px;padding:22px 28px;
                            font-size:34px;letter-spacing:6px;
                            font-weight:800;color:#0f172a;">
                  {{otp}}
                </div>
              </td>
            </tr>

            <!-- Security note -->
            <tr>
              <td align="center" style="padding:0 28px 22px;">
                <div style="font-size:12px;line-height:1.6;color:#64748b;max-width:520px;">
                  If this wasn’t you, we recommend changing your password immediately.
                  Never share this code with anyone.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding:18px 22px;text-align:center;">
                <div style="font-size:12px;color:#94a3b8;">
                  © {{year}} Mel-DemandScraper • All rights reserved
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `
},

PASSWORD_RESET: {
  subject: "Reset your password – Mel-DemandScraper",
  html: `
  <div style="margin:0;padding:0;background:#f4f7ff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f4f7ff;margin:0;padding:34px 12px;font-family:Inter,Arial,sans-serif;">
      <tr>
        <td align="center">

          <table width="640" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:640px;width:100%;
                   background:#ffffff;border-radius:22px;overflow:hidden;
                   border:1px solid #e5e7eb;
                   box-shadow:0 22px 60px rgba(15,23,42,.12);">

            <!-- Gradient strip -->
            <tr>
              <td style="height:8px;background:linear-gradient(90deg,#38bdf8,#6366f1,#22d3ee);"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:30px 28px 10px;">

                <img
                  src="https://mel-demandscraper.com/logo.png"
                  alt="Mel-DemandScraper"
                  width="240"
                  style="width:240px;max-width:240px;height:auto;display:block;border:0;"
                />

                <div style="margin-top:16px;display:inline-block;
                            background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;
                            padding:6px 12px;border-radius:999px;
                            font-size:12px;font-weight:700;">
                  Password reset
                </div>

                <h1 style="margin:16px 0 6px;font-size:26px;line-height:1.25;color:#0f172a;">
                  Reset your password
                </h1>

                <p style="margin:0;max-width:520px;font-size:14px;line-height:1.75;color:#475569;">
                  Use the code below to reset your <b style="color:#0f172a;">Mel-DemandScraper</b> password.
                  If you didn’t request this, you can safely ignore this email.
                </p>

              </td>
            </tr>

            <!-- OTP Card -->
            <tr>
              <td align="center" style="padding:22px 28px;">
                <div style="background:#f8fafc;border:1px solid #e5e7eb;
                            border-radius:18px;padding:22px 28px;
                            font-size:34px;letter-spacing:6px;
                            font-weight:800;color:#0f172a;">
                  {{otp}}
                </div>
              </td>
            </tr>

            <!-- Security note -->
            <tr>
              <td align="center" style="padding:0 28px 22px;">
                <div style="font-size:12px;line-height:1.6;color:#64748b;max-width:520px;">
                  For your security, never share this code with anyone.
                  If you think someone is trying to access your account, reset your password immediately.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding:18px 22px;text-align:center;">
                <div style="font-size:12px;color:#94a3b8;">
                  © {{year}} Mel-DemandScraper • All rights reserved
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `
},

GENERIC: {
  subject: "{{subject}}",
  html: `
  <div style="margin:0;padding:0;background:#f4f7ff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f4f7ff;margin:0;padding:34px 12px;font-family:Inter,Arial,sans-serif;">
      <tr>
        <td align="center">

          <table width="640" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:640px;width:100%;
                   background:#ffffff;border-radius:22px;overflow:hidden;
                   border:1px solid #e5e7eb;
                   box-shadow:0 22px 60px rgba(15,23,42,.12);">

            <!-- Gradient strip -->
            <tr>
              <td style="height:8px;background:linear-gradient(90deg,#38bdf8,#6366f1,#22d3ee);"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:30px 28px 12px;">

                <img
                  src="https://mel-demandscraper.com/logo.png"
                  alt="Mel-DemandScraper"
                  width="240"
                  style="width:240px;max-width:240px;height:auto;display:block;border:0;"
                />

                <div style="margin-top:16px;display:inline-block;
                            background:#f8fafc;border:1px solid #e5e7eb;color:#334155;
                            padding:6px 12px;border-radius:999px;
                            font-size:12px;font-weight:700;">
                  Notification
                </div>

                <h1 style="margin:16px 0 6px;font-size:26px;line-height:1.25;color:#0f172a;">
                  {{title}}
                </h1>

                <p style="margin:0;max-width:560px;font-size:14px;line-height:1.75;color:#475569;">
                  {{message}}
                </p>

              </td>
            </tr>

            <!-- Optional CTA Row (only shows if you pass these variables) -->
            <tr>
              <td align="center" style="padding:18px 28px 26px;">
                <a href="{{ctaUrl}}"
                  style="display:inline-block;
                         background:linear-gradient(135deg,#38bdf8,#6366f1);
                         color:#ffffff;text-decoration:none;
                         padding:14px 26px;border-radius:14px;
                         font-weight:800;font-size:14px;
                         box-shadow:0 14px 26px rgba(99,102,241,.22);">
                  {{ctaText}}
                </a>

                <div style="margin-top:12px;font-size:12px;color:#64748b;">
                  Or open the portal:
                  <a href="{{portalUrl}}" style="color:#2563eb;text-decoration:underline;font-weight:600;">
                    {{portalUrl}}
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding:18px 22px;text-align:center;">
                <div style="font-size:12px;color:#94a3b8;">
                  © {{year}} Mel-DemandScraper • All rights reserved
                </div>
              </td>
            </tr>

          </table>

          <!-- Fallback URL for CTA (if used) -->
          <div style="max-width:640px;margin:10px auto 0;
                      font-size:11px;line-height:1.5;color:#94a3b8;text-align:center;">
            If the button doesn’t work, copy and paste this link:
            <span style="color:#64748b;">{{ctaUrl}}</span>
          </div>

        </td>
      </tr>
    </table>
  </div>
  `
},


 WELCOME: {
  subject: "Welcome to Mel-DemandScraper 🎉",
  html: `
  <div style="margin:0;padding:0;background:#f4f7ff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f4f7ff;margin:0;padding:34px 12px;font-family:Inter,Arial,sans-serif;">
      <tr>
        <td align="center">

          <!-- Outer card -->
          <table width="640" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:640px;width:100%;
                   background:#ffffff;border-radius:22px;overflow:hidden;
                   border:1px solid #e5e7eb;
                   box-shadow:0 22px 60px rgba(15,23,42,.12);">

            <!-- Gradient top strip -->
            <tr>
              <td style="height:8px;background:linear-gradient(90deg,#38bdf8,#6366f1,#22d3ee);"></td>
            </tr>

            <!-- Header area -->
            <tr>
              <td align="center" style="padding:30px 28px 10px;background:#ffffff;">

                <!-- Logo -->
                <div style="display:block;">
                  <img
                    src="https://mel-demandscraper.com/logo.png"
                    alt="Mel-DemandScraper"
                    width="140"
                    style="width:240px;max-width:240px;height:auto;display:block;border:0;outline:none;text-decoration:none;"
                  />
                </div>

                <!-- Badge -->
                <div style="margin-top:16px;display:inline-block;
                            background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;
                            padding:6px 12px;border-radius:999px;
                            font-size:12px;font-weight:700;">
                  🎉 Welcome aboard
                </div>

                <!-- Title -->
                <h1 style="margin:16px 0 6px;font-size:26px;line-height:1.25;color:#0f172a;">
                  Welcome, {{firstName}} 👋
                </h1>

                <!-- Subtitle -->
                <p style="margin:0;max-width:520px;font-size:14px;line-height:1.75;color:#475569;">
                  Your account has been successfully created. You’re ready to start finding
                  <b style="color:#0f172a;"> high-intent leads</b> and exporting data in seconds.
                </p>

              </td>
            </tr>

            <!-- Primary CTA -->
            <tr>
              <td align="center" style="padding:18px 28px 10px;background:#ffffff;">
                <a href="{{portalUrl}}"
                  style="display:inline-block;
                         background:linear-gradient(135deg,#38bdf8,#6366f1);
                         color:#ffffff;text-decoration:none;
                         padding:14px 26px;border-radius:14px;
                         font-weight:800;font-size:14px;
                         box-shadow:0 14px 26px rgba(99,102,241,.22);">
                  Go to dashboard
                </a>

                <div style="margin-top:12px;font-size:12px;color:#64748b;">
                  Or sign in anytime at
                  <a href="{{portalUrl}}" style="color:#2563eb;text-decoration:underline;font-weight:600;">
                    {{portalUrl}}
                  </a>
                </div>
              </td>
            </tr>

            <!-- 3 Feature cards (below) -->
            <tr>
              <td style="padding:18px 22px 6px;background:#ffffff;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td width="33.33%" style="padding:8px;">
                      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:14px;">
                        <div style="font-size:11px;color:#64748b;">Step 1</div>
                        <div style="margin-top:4px;font-size:14px;font-weight:800;color:#0f172a;">
                          Build a list
                        </div>
                        <div style="margin-top:6px;font-size:12px;line-height:1.55;color:#64748b;">
                          Filter by role, location, intent, and more.
                        </div>
                      </div>
                    </td>

                    <td width="33.33%" style="padding:8px;">
                      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:14px;">
                        <div style="font-size:11px;color:#64748b;">Step 2</div>
                        <div style="margin-top:4px;font-size:14px;font-weight:800;color:#0f172a;">
                          Verify emails
                        </div>
                        <div style="margin-top:6px;font-size:12px;line-height:1.55;color:#64748b;">
                          Improve deliverability with debounce checks.
                        </div>
                      </div>
                    </td>

                    <td width="33.33%" style="padding:8px;">
                      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:14px;">
                        <div style="font-size:11px;color:#64748b;">Step 3</div>
                        <div style="margin-top:4px;font-size:14px;font-weight:800;color:#0f172a;">
                          Export fast
                        </div>
                        <div style="margin-top:6px;font-size:12px;line-height:1.55;color:#64748b;">
                          Download CSV/Excel from Export History anytime.
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Support note -->
            <tr>
              <td align="center" style="padding:12px 28px 22px;background:#ffffff;">
                <div style="font-size:12px;color:#64748b;max-width:560px;line-height:1.6;">
                  Need help getting started? Reply to this email and our team will help you set up your
                  first export workflow.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;background:#ffffff;padding:18px 22px;text-align:center;">
                <div style="font-size:12px;color:#94a3b8;">
                  You received this email because you created an account on Mel-DemandScraper.
                </div>
                <div style="margin-top:8px;font-size:11px;color:#94a3b8;">
                  © {{year}} Mel-DemandScraper • All rights reserved
                </div>
              </td>
            </tr>

          </table>

          <!-- Fallback URL -->
          <div style="max-width:640px;margin:10px auto 0;
                      font-size:11px;line-height:1.5;color:#94a3b8;text-align:center;">
            If the button doesn’t work, copy and paste this link:
            <span style="color:#64748b;">{{portalUrl}}</span>
          </div>

        </td>
      </tr>
    </table>
  </div>
  `
},


  // ✅ NEW
EXPORT_READY: {
  subject: "Your export is ready – {{listName}}",
  html: `
  <div style="margin:0;padding:0;background:#f4f7ff;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#f4f7ff;margin:0;padding:34px 12px;font-family:Inter,Arial,sans-serif;">
      <tr>
        <td align="center">

          <!-- Outer card -->
          <table width="640" cellpadding="0" cellspacing="0" role="presentation"
            style="max-width:640px;width:100%;
                   background:#ffffff;border-radius:22px;overflow:hidden;
                   border:1px solid #e5e7eb;
                   box-shadow:0 22px 60px rgba(15,23,42,.12);">

            <!-- Gradient top strip -->
            <tr>
              <td style="height:8px;background:linear-gradient(90deg,#38bdf8,#6366f1,#22d3ee);"></td>
            </tr>

            <!-- Header area -->
            <tr>
              <td align="center" style="padding:30px 28px 10px;background:#ffffff;">

                <!-- Logo (from your public/logo.png via absolute URL) -->
                <div style="display:block;">
                  <img
                    src="https://mel-demandscraper.com/logo.png"
                    alt="Mel-Scrapper"
                    width="140"
                    style="width:240px;max-width:240px;height:auto;display:block;border:0;outline:none;text-decoration:none;"
                  />
                </div>

                <!-- Badge -->
                <div style="margin-top:16px;display:inline-block;
                            background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;
                            padding:6px 12px;border-radius:999px;
                            font-size:12px;font-weight:700;">
                  ✅ Export completed
                </div>

                <!-- Title -->
                <h1 style="margin:16px 0 6px;font-size:26px;line-height:1.25;color:#0f172a;">
                  Your export is ready
                </h1>

                <!-- Subtitle -->
                <p style="margin:0;max-width:520px;font-size:14px;line-height:1.75;color:#475569;">
                  Your export <b style="color:#0f172a;">{{listName}}</b> is ready to download.
                  Use the button below to get your file.
                </p>

              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:18px 28px 10px;background:#ffffff;">
                <a href="{{downloadUrl}}"
                  style="display:inline-block;
                         background:linear-gradient(135deg,#38bdf8,#6366f1);
                         color:#ffffff;text-decoration:none;
                         padding:14px 26px;border-radius:14px;
                         font-weight:800;font-size:14px;
                         box-shadow:0 14px 26px rgba(99,102,241,.22);">
                  Download export
                </a>

                <div style="margin-top:12px;font-size:12px;color:#64748b;">
                  Or view it anytime from
                  <a href="{{portalUrl}}" style="color:#2563eb;text-decoration:underline;font-weight:600;">
                    Export History
                  </a>
                </div>
              </td>
            </tr>

            <!-- 3 Meta cards (below) -->
            <tr>
              <td style="padding:18px 22px 6px;background:#ffffff;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td width="33.33%" style="padding:8px;">
                      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:14px;">
                        <div style="font-size:11px;color:#64748b;">Entity</div>
                        <div style="margin-top:4px;font-size:14px;font-weight:800;color:#0f172a;">
                          {{entity}}
                        </div>
                      </div>
                    </td>
                    <td width="33.33%" style="padding:8px;">
                      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:14px;">
                        <div style="font-size:11px;color:#64748b;">Format</div>
                        <div style="margin-top:4px;font-size:14px;font-weight:800;color:#0f172a;">
                          {{format}}
                        </div>
                      </div>
                    </td>
                    <td width="33.33%" style="padding:8px;">
                      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:14px;">
                        <div style="font-size:11px;color:#64748b;">Rows</div>
                        <div style="margin-top:4px;font-size:14px;font-weight:800;color:#0f172a;">
                          {{rowCount}}
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Expiry / note -->
            <tr>
              <td align="center" style="padding:12px 28px 22px;background:#ffffff;">
                <div style="font-size:12px;color:#64748b;">
                  This link expires on <b style="color:#0f172a;">{{expiresAt}}</b>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;background:#ffffff;padding:18px 22px;text-align:center;">
                <div style="font-size:12px;color:#94a3b8;">
                  You received this email because you requested an export in Mel-Scrapper.
                </div>
                <div style="margin-top:8px;font-size:11px;color:#94a3b8;">
                  © {{year}} Mel-Scrapper • All rights reserved
                </div>
              </td>
            </tr>

          </table>

          <!-- Fallback URL -->
          <div style="max-width:640px;margin:10px auto 0;
                      font-size:11px;line-height:1.5;color:#94a3b8;text-align:center;">
            If the button doesn’t work, copy and paste this link:
            <span style="color:#64748b;">{{downloadUrl}}</span>
          </div>

        </td>
      </tr>
    </table>
  </div>
  `
}

};
