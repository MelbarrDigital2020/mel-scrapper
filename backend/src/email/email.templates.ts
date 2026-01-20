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
  }

};
