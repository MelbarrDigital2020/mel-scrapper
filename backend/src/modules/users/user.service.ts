import pool from "../../config/db"; // <-- adjust path if your pool is elsewhere

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
