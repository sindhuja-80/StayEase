import express from "express";

import {
  createRoom,
  getRooms,
  getSingleRoom,
  getOwnerRooms,
  toggleRoomAvailability
} from "../controllers/roomController.js";

import protect from "../middleware/protect.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/create", protect, upload.array("images", 4), createRoom);

router.get("/", getRooms);

router.get("/owner/rooms", protect, getOwnerRooms);

router.get("/:id", getSingleRoom);

router.post("/toggle", protect, toggleRoomAvailability);

export default router;