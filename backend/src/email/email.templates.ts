export const emailTemplates = {
  REGISTER_OTP: {
    subject: "Verify your email – Mel-DemandScraper",
    html: `
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <h1>{{otp}}</h1>
      <p>This code is valid for {{expiresIn}} minutes.</p>
    `
  },

  LOGIN_OTP: {
    subject: "Your login verification code",
    html: `
      <h2>Login Verification</h2>
      <p>Your OTP is:</p>
      <h1>{{otp}}</h1>
    `
  },

  PASSWORD_RESET: {
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>Use this code to reset your password:</p>
      <h1>{{otp}}</h1>
    `
  },

  GENERIC: {
    subject: "{{subject}}",
    html: `
      <h2>{{title}}</h2>
      <p>{{message}}</p>
    `
  },

  WELCOME: {
    subject: "Welcome to Mel-DemandScraper 🎉",
    html: `
      <h2>Welcome, {{firstName}} 👋</h2>
      <p>Your account has been successfully created.</p>
      <p>You can now log in and start using <b>Mel-DemandScraper</b>.</p>
      <p>If you have any questions, feel free to reach out.</p>
      <br />
      <p>— Team Mel-DemandScraper</p>
    `
  },

  // ✅ NEW
  EXPORT_READY: {
    subject: "Your export is ready – {{listName}}",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>✅ Your export is ready</h2>

        <p>
          Your data export <b>{{listName}}</b> is now ready to download.
        </p>

        <p>
          <b>Entity:</b> {{entity}}<br/>
          <b>Format:</b> {{format}}<br/>
          <b>Rows:</b> {{rowCount}}
        </p>

        <p style="margin: 24px 0;">
          <a href="{{downloadUrl}}"
             style="background:#111827;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;display:inline-block;">
            Download now
          </a>
        </p>

        <p style="color:#6b7280;font-size: 13px;">
          You can also log in to the portal and download it anytime from <b>Export History</b>:
          <a href="{{portalUrl}}">{{portalUrl}}</a>
        </p>

        <hr style="margin: 24px 0; border:0; border-top:1px solid #e5e7eb;" />

        <p style="color:#9ca3af;font-size:12px;">
          This download link expires on {{expiresAt}}.
        </p>
      </div>
    `
  }
};
