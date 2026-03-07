import express from "express"
import "dotenv/config"
import cors from "cors"
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebHooks.js"
import hotelRouter from "./routes/hotelRoutes.js"
import connectCloudinary from "./config/coludinary.js"
import roomRouter from "./routes/roomRoutes.js"
import bookingRouter from "./routes/bookingRoutes.js"
import userRouter from "./routes/userRoutes.js"
import { initDB } from "./config/db.js"

const app = express()

app.use(cors())

// Clerk webhook route
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
)

app.use(clerkMiddleware())
app.use(express.json())

app.get('/', (req, res) => res.send("API is working"))

app.use("/api/user", userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/bookings', bookingRouter)

// initialize services
await initDB()
await connectCloudinary()

export default app