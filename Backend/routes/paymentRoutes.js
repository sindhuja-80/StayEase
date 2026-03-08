import express from "express"
import { createStripeSession } from "../controllers/paymentController.js"
import protect from "../middleware/protect.js"

const paymentRouter = express.Router()

paymentRouter.post("/create-session",protect,createStripeSession)

export default paymentRouter