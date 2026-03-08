import { v2 as cloudinary } from "cloudinary";
import pool from "../config/db.js";
import fs from "fs";


// CREATE ROOM
export const createRoom = async (req, res) => {
  try {

    const { roomType, pricePerNight, amenities } = req.body;

    const authInfo = typeof req.auth === "function" ? req.auth() : req.auth;

    if (!authInfo?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!roomType || !pricePerNight) {
      return res.json({
        success: false,
        message: "Room type and price are required"
      });
    }

    // find owner hotel
    const hotelRes = await pool.query(
      "SELECT * FROM hotels WHERE owner = $1",
      [authInfo.userId]
    );

    const hotel = hotelRes.rows[0];

    if (!hotel) {
      return res.json({
        success: false,
        message: "No hotel found"
      });
    }

    // parse amenities safely
    let parsedAmenities = [];

    if (amenities) {
      try {
        parsedAmenities =
          typeof amenities === "string"
            ? JSON.parse(amenities)
            : amenities;
      } catch {
        parsedAmenities = [];
      }
    }

    // upload images safely
    let imageUrls = [];

    if (req.files && req.files.length > 0) {

      imageUrls = await Promise.all(
        req.files.map(async (file) => {

          const result = await cloudinary.uploader.upload(file.path, {
            folder: "stayease-rooms"
          });

          try {
            fs.unlinkSync(file.path);
          } catch {}

          return result.secure_url;
        })
      );

    }

    await pool.query(
      `INSERT INTO rooms (hotel, room_type, price_per_night, amenities, images)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        hotel.id,
        roomType,
        pricePerNight,
        JSON.stringify(parsedAmenities),
        imageUrls
      ]
    );

    res.json({
      success: true,
      message: "Room created successfully"
    });

  } catch (error) {

    console.error("Create room error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// GET ALL ROOMS
export const getRooms = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT 
        r.*,
        h.name AS hotel_name,
        h.address AS hotel_address,
        h.city AS hotel_city,
        h.owner,
        u.image AS owner_image
      FROM rooms r
      JOIN hotels h ON r.hotel = h.id
      JOIN users u ON h.owner = u.id
      WHERE r.is_available = true
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      rooms: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// GET SINGLE ROOM
export const getSingleRoom = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        r.*,
        h.name AS hotel_name,
        h.address AS hotel_address,
        h.city AS hotel_city,
        h.owner,
        u.image AS owner_image
      FROM rooms r
      JOIN hotels h ON r.hotel = h.id
      JOIN users u ON h.owner = u.id
      WHERE r.id = $1
    `,[id]);

    if (!result.rows[0]) {
      return res.json({
        success: false,
        message: "Room not found"
      });
    }

    res.json({
      success: true,
      room: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// GET OWNER ROOMS
export const getOwnerRooms = async (req, res) => {
  try {

    const authInfo = typeof req.auth === "function" ? req.auth() : req.auth;

    if (!authInfo?.userId) {
      return res.json({
        success: false,
        message: "Unauthorized"
      });
    }

    const hotelRes = await pool.query(
      "SELECT * FROM hotels WHERE owner = $1",
      [authInfo.userId]
    );

    const hotel = hotelRes.rows[0];

    if (!hotel) {
      return res.json({
        success: false,
        message: "No hotel found"
      });
    }

    const roomsRes = await pool.query(
      "SELECT * FROM rooms WHERE hotel = $1",
      [hotel.id]
    );

    res.json({
      success: true,
      rooms: roomsRes.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// TOGGLE ROOM AVAILABILITY
export const toggleRoomAvailability = async (req, res) => {
  try {

    const { roomId } = req.body;

    if (!roomId) {
      return res.json({
        success: false,
        message: "Room ID required"
      });
    }

    const roomRes = await pool.query(
      "SELECT * FROM rooms WHERE id = $1",
      [roomId]
    );

    const room = roomRes.rows[0];

    if (!room) {
      return res.json({
        success: false,
        message: "Room not found"
      });
    }

    await pool.query(
      `UPDATE rooms
       SET is_available = $1, updated_at = NOW()
       WHERE id = $2`,
      [!room.is_available, roomId]
    );

    res.json({
      success: true,
      message: "Room availability updated"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};