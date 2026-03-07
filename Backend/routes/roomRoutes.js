import express from "express"
import upload from "../middleware/uploadMiddleware.js"
import { protect } from "../middleware/authMiddleware.js"
import { createRoom, getOwnerRooms, getRooms, getSingleRoom, toggleRoomAvailability } from "../controllers/roomController.js"

const roomRouter=express.Router()

// Specific routes MUST come before generic :id route
roomRouter.post("/",protect,upload.array("images",4),createRoom)
roomRouter.post('/toggle-availability',protect,toggleRoomAvailability)
roomRouter.get('/owner',protect,getOwnerRooms)
roomRouter.get('/:id', getSingleRoom)
roomRouter.get('/',getRooms)

export default roomRouter