import express from "express"
import authMiddleware from "../middleware/auth-middleware.js"
import userController from "../controller/user-controller.js"
import roleMiddleware from "../middleware/role-middleware.js"

const protectedRouter = express.Router()

protectedRouter.use(authMiddleware)

protectedRouter.post("/api/users/logout", userController.logout)
protectedRouter.get("/api/users/current", userController.get)

protectedRouter.use(roleMiddleware)

export default protectedRouter