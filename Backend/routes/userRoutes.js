import express from "express";

import protect from "../middleware/protect.js";

import {
  getUser,
  storeRecentSearchedCities,
  getAllUsers,
  createTestUser
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", getUser);

userRouter.get("/all", getAllUsers);

userRouter.post("/store-recent-search", protect, storeRecentSearchedCities);

userRouter.post("/test-create", createTestUser);

export default userRouter;