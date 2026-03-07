import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { getUserData,
   storeRecentSearchedCities,
   getAllUsers,
   createTestUser } from "../controllers/userController.js"

const userRouter=express.Router()
userRouter.get('/',protect,getUserData)
// debug route - list all users (protected for now)
userRouter.get('/all',getAllUsers)
userRouter.post('/store-recent-search',protect,storeRecentSearchedCities)
// debug endpoint - create test user
userRouter.post('/test-create',createTestUser)

export default userRouter