import express from "express"
import authMiddleware from "../middleware/auth-middleware.js"
import userController from "../controller/user-controller.js"
import categoryController from "../controller/category-controller.js"
import colorController from "../controller/color-controller.js"
import sizeController from "../controller/size-controller.js"
import roleMiddleware from "../middleware/role-middleware.js"

const protectedRouter = express.Router()

protectedRouter.use(authMiddleware)

protectedRouter.post("/api/users/logout", userController.logout)
protectedRouter.get("/api/users/current", userController.get)

protectedRouter.use(roleMiddleware)

protectedRouter.post("/api/admin/categories", categoryController.create)
protectedRouter.put("/api/admin/categories/:categoryId", categoryController.update)
protectedRouter.delete("/api/admin/categories/:categoryId", categoryController.remove)

export default protectedRouter