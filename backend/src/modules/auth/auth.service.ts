import pool from "../../config/db";
import bcrypt from "bcrypt";
import { RegisterStartDTO, LoginDTO } from "./auth.types";
import { createRegisterOtp, verifyRegisterOtp, invalidateRegisterOtps, createLoginOtp  } from "./otp.service";
import { generateAccessToken } from "../../utils/jwt";
import { sendEmail } from "../../email/email.service";
import { LoginResponse } from "./auth.types";
import { OAuth2Client } from "google-auth-library";


const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_BASE_URL}/api/auth/google/callback`
);

export const getGoogleAuthUrl = () => {
  return googleClient.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    access_type: "offline",
    prompt: "consent",
  });
};


export const startRegistration = async (data: RegisterStartDTO) => {
  const { firstName, lastName, email } = data;

  const avatar_url = `${process.env.APP_URL}/avatars/default_avatar.jpg`;

  const existing = await pool.query(
    `
    SELECT id, email_is_verified, password
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  // User exists
  if (existing.rows.length > 0) {
    const user = existing.rows[0];

    // Fully registered → block
    if (user.email_is_verified && user.password) {
      throw new Error("Email already registered");
    }

    // Incomplete registration → resend OTP
    await createRegisterOtp(user.id, email);

    return {
      userId: user.id,
      email
    };
  }

  // New user
  const result = await pool.query(
    `
    INSERT INTO users (first_name, last_name, email, avatar_url, email_is_verified)
    VALUES ($1, $2, $3, $4, false)
    RETURNING id, email
    `,
    [firstName, lastName, email, avatar_url]
  );

  const user = result.rows[0];

  await createRegisterOtp(user.id, email);

  return {
    userId: user.id,
    email: user.email
  };
};

export const verifyRegistrationOtp = async (userId: string, otp: string) => {
  if (!userId || !otp) {
    throw new Error("User ID and OTP are required");
  }

  await verifyRegisterOtp(userId, otp, "REGISTER");

  return true;
};

export const completeRegistration = async (
  userId: string,
  password: string
) => {
  if (!userId || !password) {
    throw new Error("User ID and password are required");
  }

  const result = await pool.query(
    `
    SELECT email, first_name, email_is_verified, password
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  if (!user.email_is_verified) {
    throw new Error("Email not verified");
  }

  if (user.password) {
    throw new Error("Account already completed");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    `
    UPDATE users
    SET password = $1,
        is_active = true,
        updated_at = NOW()
    WHERE id = $2
    `,
    [hashedPassword, userId]
  );

  // ✅ SEND WELCOME EMAIL
  await sendEmail({
    to: user.email,
    template: "WELCOME",
    data: {
      firstName: user.first_name
    }
  });

  return true;
};

export const loginUser = async (
  data: LoginDTO,
  ipAddress?: string
): Promise<LoginResponse> => {
  const { email, password } = data;

  const result = await pool.query(
    `
    SELECT id, email, password, email_is_verified, is_active, two_fa_enabled
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  if (!user.email_is_verified) {
    throw new Error("Email not verified");
  }

  if (!user.is_active) {
    throw new Error("Account inactive");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  /* 🔐 2FA FLOW */
  if (user.two_fa_enabled) {
    await createLoginOtp(user.id, user.email);

    return {
      twoFaRequired: true,
      userId: user.id,
    };
  }

  /* ✅ NO 2FA */
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return {
    twoFaRequired: false,
    accessToken,
  };
};

export const verifyLoginOtp = async (
  userId: string,
  otp: string,
  ipAddress?: string
) => {
  await verifyRegisterOtp(userId, otp, "LOGIN_2FA");

  // Update login info
  await pool.query(
    `
    UPDATE users
    SET last_login = NOW(),
        last_login_ip = $1
    WHERE id = $2
    `,
    [ipAddress || null, userId]
  );

  const result = await pool.query(
    `SELECT email FROM users WHERE id = $1`,
    [userId]
  );

  const accessToken = generateAccessToken({
    userId,
    email: result.rows[0].email
  });

  return { accessToken };
};

export const resendRegistrationOtp = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const result = await pool.query(
    `
    SELECT id, email_is_verified, password
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  // Fully registered → no resend
  if (user.email_is_verified && user.password) {
    throw new Error("Account already completed");
  }

  // Invalidate previous OTPs
  await invalidateRegisterOtps(user.id);

  // Create & send new OTP
  await createRegisterOtp(user.id, email);

  return true;
};

export const resendLoginOtp = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const result = await pool.query(
    `
    SELECT id, email, two_fa_enabled
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  if (!user.two_fa_enabled) {
    throw new Error("2FA not enabled for this user");
  }

  await createLoginOtp(user.id, user.email);

  return true;
};


export const loginWithGoogle = async (code: string, ipAddress?: string) => {
  // 1) Exchange code -> tokens
  const { tokens } = await googleClient.getToken(code);
  if (!tokens.id_token) throw new Error("Google login failed: missing id_token");

  // 2) Verify token -> profile
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Google login failed: missing email");

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  const firstName = payload.given_name || null;
  const lastName = payload.family_name || null;
  const avatarUrl = payload.picture || null;
  const emailVerified = !!payload.email_verified;

  // 3) Find existing user by email
  const existingByEmail = await pool.query(
    `
    SELECT id, email, is_active, email_is_verified, role, google_id
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
    `,
    [email]
  );

  let userId: string;
  let userRole: string;

  if (existingByEmail.rows.length > 0) {
    const u = existingByEmail.rows[0];

    if (!u.is_active) throw new Error("Account inactive");

    // Link google_id if not linked yet + mark verified if google says verified
    const updated = await pool.query(
      `
      UPDATE users
      SET
        google_id = COALESCE(google_id, $1),
        auth_provider = CASE
          WHEN auth_provider IS NULL OR auth_provider = 'local' THEN 'google'
          ELSE auth_provider
        END,
        email_is_verified = CASE WHEN $2 THEN true ELSE email_is_verified END,
        first_name = COALESCE(first_name, $3),
        last_name  = COALESCE(last_name,  $4),
        avatar_url = COALESCE(avatar_url, $5),
        last_login = NOW(),
        last_login_ip = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING id, role
      `,
      [googleId, emailVerified, firstName, lastName, avatarUrl, ipAddress || null, u.id]
    );

    userId = updated.rows[0].id;
    userRole = updated.rows[0].role;
  } else {
    // 4) Create new user
    const created = await pool.query(
      `
      INSERT INTO users
        (first_name, last_name, email, password, role, is_active, email_is_verified,
         google_id, auth_provider, avatar_url, last_login, last_login_ip, created_at, updated_at)
      VALUES
        ($1, $2, $3, NULL, 'user', true, $4,
         $5, 'google', $6, NOW(), $7, NOW(), NOW())
      RETURNING id, role
      `,
      [firstName, lastName, email, emailVerified, googleId, avatarUrl, ipAddress || null]
    );

    userId = created.rows[0].id;
    userRole = created.rows[0].role;
  }

  // 5) Issue your normal JWT (same as password login)
  const accessToken = generateAccessToken({
    userId,
    email
  } as any);

  return { accessToken };
};
