import { v2 as cloudinary } from "cloudinary";
import client from "../config/db.js";
import fs from "fs";

// CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;

    const authInfo = typeof req.auth === "function" ? req.auth() : req.auth;

    if (!authInfo?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Find hotel of owner
    const hotelResult = await client.query(
      "SELECT * FROM hotels WHERE owner = $1",
      [authInfo.userId]
    );

    const hotel = hotelResult.rows[0];

    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }

    // Parse amenities
    let parsedAmenities = [];

    if (amenities) {
      try {
        parsedAmenities =
          typeof amenities === "string" ? JSON.parse(amenities) : amenities;
      } catch {
        parsedAmenities = [];
      }
    }

    // Check images
    if (!req.files || req.files.length === 0) {
      return res.json({ success: false, message: "No images provided" });
    }

    // Upload images to cloudinary
    const uploadImages = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "stayease-rooms",
        });

        fs.unlinkSync(file.path);

        return result.secure_url;
      })
    );

    // Insert room
    await client.query(
      `INSERT INTO rooms (hotel, room_type, price_per_night, amenities, images)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        hotel.id,
        roomType,
        Number(pricePerNight),
        JSON.stringify(parsedAmenities),
        uploadImages,
      ]
    );

    res.json({
      success: true,
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Create Room Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL ROOMS
export const getRooms = async (req, res) => {
  try {
    const result = await client.query(`
      SELECT r.*, h.owner as hotel_owner, u.image as owner_image
      FROM rooms r
      JOIN hotels h ON r.hotel = h.id
      JOIN users u ON h.owner = u.id
      WHERE r.is_available = true
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      rooms: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE ROOM
export const getSingleRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT r.*, h.owner as hotel_owner, u.image as owner_image
       FROM rooms r
       JOIN hotels h ON r.hotel = h.id
       JOIN users u ON h.owner = u.id
       WHERE r.id = $1`,
      [id]
    );

    const room = result.rows[0];

    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    res.json({
      success: true,
      room,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET OWNER ROOMS
export const getOwnerRooms = async (req, res) => {
  try {
    const authInfo = typeof req.auth === "function" ? req.auth() : req.auth;
    console.log("USER ID:", authInfo.userId);
    const hotelRes = await client.query(
      "SELECT * FROM hotels WHERE owner = $1",
      [authInfo?.userId]
    );

    const hotel = hotelRes.rows[0];

    if (!hotel) {
      return res.json({ success: false, message: "No Hotel found" });
    }

    const roomsRes = await client.query(
      "SELECT * FROM rooms WHERE hotel = $1",
      [hotel.id]
    );

    res.json({
      success: true,
      rooms: roomsRes.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// TOGGLE ROOM AVAILABILITY
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const roomRes = await client.query(
      "SELECT * FROM rooms WHERE id = $1",
      [roomId]
    );

    const room = roomRes.rows[0];

    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    const newStatus = !room.is_available;

    await client.query(
      "UPDATE rooms SET is_available=$1, updated_at=NOW() WHERE id=$2",
      [newStatus, roomId]
    );

    res.json({
      success: true,
      message: "Room availability updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};