import express from "express"
import userController from "../controller/user-controller.js"

const publicRouter = express.Router()

publicRouter.post("/api/users", userController.create)
publicRouter.get("/test", (req, res, next) => {
    res.send("<a href='/auth/google'>Google Login</a>")
})
publicRouter.get("/auth/google", userController.google)
publicRouter.get("/auth/google/callback", userController.googleCallback)

export default publicRouter