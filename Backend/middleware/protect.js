import pool from "../config/db.js";

const protect = async (req, res, next) => {
  try {

    const authInfo = typeof req.auth === "function" ? req.auth() : req.auth;

    const { userId } = authInfo || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (!result.rows[0]) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = result.rows[0];

    next();

  } catch (error) {

    console.error("Auth middleware error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export default protect;