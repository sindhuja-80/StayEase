import client from "../config/db.js";

export const registerHotel = async (req, res) => {
  try {

    const authInfo = typeof req.auth === "function" ? req.auth() : req.auth;

    const { name, address, contact, city } = req.body;

    const existingHotel = await client.query(
      "SELECT * FROM hotels WHERE owner = $1",
      [authInfo.userId]
    );

    if (existingHotel.rows.length > 0) {
      return res.json({
        success: false,
        message: "Hotel already registered",
      });
    }

    await client.query(
      `INSERT INTO hotels (name,address,contact,city,owner)
       VALUES ($1,$2,$3,$4,$5)`,
      [name, address, contact, city, authInfo.userId]
    );

    res.json({
      success: true,
      message: "Hotel registered successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};