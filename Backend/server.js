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
import client, { initDB } from "./config/db.js"


// initialize services
const startServer = async () => {
  await initDB();
  await connectCloudinary();

  const app = express();
  app.use(cors());

  // raw route for Clerk webhooks (must come before express.json)
  app.post(
    "/api/clerk",
    express.raw({ type: "application/json" }),
    clerkWebhooks
  );

  // middleware
  app.use(clerkMiddleware());
  app.use(express.json());

  app.get('/', (req, res) => res.send("API is working "));
  app.use("/api/user", userRouter);
  app.use('/api/hotels', hotelRouter);
  app.use('/api/rooms', roomRouter);
  app.use('/api/bookings', bookingRouter);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`server running on port ${PORT}`));
};

startServer();