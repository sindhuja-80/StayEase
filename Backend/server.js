import express from "express";
import "dotenv/config";
import cors from "cors";

import { clerkMiddleware } from "@clerk/express";

import clerkWebhooks from "./controllers/clerkWebHooks.js";

import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import { initDB } from "./config/db.js";

const app = express();


// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://stayease-frontendurl.vercel.app/"
    ],
    credentials: true
  })
);

// Clerk Webhook (RAW BODY REQUIRED)
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);


// Clerk Auth Middleware
app.use(clerkMiddleware());


// JSON parser
app.use(express.json());


// Test route
app.get("/", (req, res) => {
  res.send("API is working");
});


// Routes
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
// Start Server
const startServer = async () => {

  try {

    await initDB();
    await connectCloudinary();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {

    console.error("Server startup error:", error);

  }

};

startServer();

export default app;