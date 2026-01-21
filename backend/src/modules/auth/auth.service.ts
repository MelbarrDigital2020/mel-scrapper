import pool from "../../config/db";
import bcrypt from "bcrypt";
import { RegisterStartDTO, LoginDTO } from "./auth.types";
import { createRegisterOtp, verifyRegisterOtp, invalidateRegisterOtps, createLoginOtp  } from "./otp.service";
import { generateAccessToken } from "../../utils/jwt";
import { sendEmail } from "../../email/email.service";
import { LoginResponse } from "./auth.types";


export const startRegistration = async (data: RegisterStartDTO) => {
  const { firstName, lastName, email } = data;

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
    INSERT INTO users (first_name, last_name, email, email_is_verified)
    VALUES ($1, $2, $3, false)
    RETURNING id, email
    `,
    [firstName, lastName, email]
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
