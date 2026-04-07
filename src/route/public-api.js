import express from "express"
import userController from "../controller/user-controller.js"
import categoryController from "../controller/category-controller.js";
import colorController from "../controller/color-controller.js";
import sizeController from "../controller/size-controller.js";

const publicRouter = express.Router()

publicRouter.post("/api/users", userController.create)
publicRouter.get("/auth/google", userController.google)
publicRouter.get("/auth/google/callback", userController.googleCallback)
publicRouter.post("/api/users/login", userController.login)

publicRouter.get("/api/categories", categoryController.search);
publicRouter.get("/api/categories/:categoryId", categoryController.get);

publicRouter.get("/api/colors", colorController.search);
publicRouter.get("/api/colors/:colorId", colorController.get);

export default publicRouter