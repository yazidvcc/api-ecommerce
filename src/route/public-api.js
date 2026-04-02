import express from "express"
import userController from "../controller/user-controller.js"

const publicRouter = express.Router()

publicRouter.post("/api/users", userController.create)
publicRouter.get("/auth/google", userController.google)
publicRouter.get("/auth/google/callback", userController.googleCallback)
publicRouter.post("/api/users/login", userController.login)

export default publicRouter