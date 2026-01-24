import pool from "../../config/db"; // <-- adjust path if your pool is elsewhere
import bcrypt from "bcrypt";

export const toggleTwoFA = async (userId: string) => {
  const result = await pool.query(
    `
    UPDATE users
    SET two_fa_enabled = NOT two_fa_enabled,
        updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      first_name,
      last_name,
      email,
      role,
      is_active,
      email_is_verified,
      two_fa_enabled,
      last_login,
      last_login_ip,
      created_at,
      updated_at,
      avatar_url,
      contact_number,
      bio,
      timezone
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // 1️⃣ Get current password hash
  const userRes = await pool.query(
    `
    SELECT id, password
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (userRes.rows.length === 0) {
    throw new Error("User not found");
  }

  const { password } = userRes.rows[0];

  // 2️⃣ Verify current password
  const isValid = await bcrypt.compare(currentPassword, password);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  // 3️⃣ Prevent same password reuse
  const isSame = await bcrypt.compare(newPassword, password);
  if (isSame) {
    throw new Error("New password must be different from current password");
  }

  // 4️⃣ Hash new password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // 5️⃣ Update password
  await pool.query(
    `
    UPDATE users
    SET password = $2,
        updated_at = NOW()
    WHERE id = $1
    `,
    [userId, hashedPassword]
  );

  return true;
};

