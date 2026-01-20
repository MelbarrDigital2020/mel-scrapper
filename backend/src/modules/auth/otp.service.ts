import pool from "../../config/db";
import bcrypt from "bcrypt";
import { generateOtp } from "../../utils/otp";
import { sendEmail } from "../../email/email.service";

// ======================
// REGISTER – CREATE OTP
// ======================
export const createRegisterOtp = async (  userId: string, email: string) => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await pool.query(
    `INSERT INTO otp (user_id, otp_hash, purpose, expires_at)
     VALUES ($1, $2, 'REGISTER', $3)`,
    [userId, otpHash, expiresAt]
  );

    // 📧 SEND OTP EMAIL (Hostinger)
  await sendEmail({
    to: email,
    template: "REGISTER_OTP",
    data: {
      otp,
      expiresIn: 10
    }
  });

  return otp; // send via email later
};

// ======================
// REGISTER – VERIFY OTP
// ======================
export const verifyRegisterOtp = async (
  userId: string,
  otp: string,
  purpose: "REGISTER" | "LOGIN_2FA"
) => {
  const result = await pool.query(
    `
    SELECT id, otp_hash, expires_at
    FROM otp
    WHERE user_id = $1
      AND purpose = $2
      AND is_used = false
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId, purpose]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid OTP");
  }

  const record = result.rows[0];

  if (new Date(record.expires_at) < new Date()) {
    throw new Error("OTP expired");
  }

  const isValid = await bcrypt.compare(otp, record.otp_hash);
  if (!isValid) {
    throw new Error("Invalid OTP");
  }

  await pool.query(
    `UPDATE otp SET is_used = true WHERE id = $1`,
    [record.id]
  );

  // For REGISTER flow only
  if (purpose === "REGISTER") {
    await pool.query(
      `UPDATE users SET email_is_verified = true WHERE id = $1`,
      [userId]
    );
  }

  return true;
};

export const invalidateRegisterOtps = async (userId: string) => {
  await pool.query(
    `
    UPDATE otp
    SET is_used = true
    WHERE user_id = $1
      AND purpose = 'REGISTER'
      AND is_used = false
    `,
    [userId]
  );
};

export const createLoginOtp = async (
  userId: string,
  email: string
) => {
  // Invalidate old login OTPs
  await pool.query(
    `
    UPDATE otp
    SET is_used = true
    WHERE user_id = $1
      AND purpose = 'LOGIN_2FA'
      AND is_used = false
    `,
    [userId]
  );

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await pool.query(
    `
    INSERT INTO otp (user_id, otp_hash, purpose, expires_at)
    VALUES ($1, $2, 'LOGIN_2FA', $3)
    `,
    [userId, otpHash, expiresAt]
  );

  await sendEmail({
    to: email,
    template: "LOGIN_OTP",
    data: { otp }
  });

  return true;
};
