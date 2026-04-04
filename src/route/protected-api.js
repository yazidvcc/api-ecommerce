import express from "express"
import authMiddleware from "../middleware/auth-middleware.js"
import userController from "../controller/user-controller.js"

const protectedRouter = express.Router()
protectedRouter.use(authMiddleware)

protectedRouter.post("/api/users/logout", userController.logout)

export default protectedRouter