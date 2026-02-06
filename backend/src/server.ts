import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import pool from "./config/db";



const PORT = process.env.PORT || 4010;

app.listen(PORT, async () => {
  try {
    await pool.query("SELECT 1");
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err) {
    console.error("❌ Database connection failed", err);
  }
});
