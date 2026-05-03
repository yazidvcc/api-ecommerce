import express from "express"
import authMiddleware from "../middleware/auth-middleware.js"
import userController from "../controller/user-controller.js"
import categoryController from "../controller/category-controller.js"
import colorController from "../controller/color-controller.js"
import sizeController from "../controller/size-controller.js"
import roleMiddleware from "../middleware/role-middleware.js"
import productController from "../controller/product-controller.js"
import cartController from "../controller/cart-controller.js"
import orderController from "../controller/order-controller.js"

const protectedRouter = express.Router()

protectedRouter.use(authMiddleware)

protectedRouter.post("/api/users/logout", userController.logout)
protectedRouter.get("/api/users/current", userController.get)

protectedRouter.use(roleMiddleware)

protectedRouter.post("/api/admin/categories", categoryController.create)
protectedRouter.put("/api/admin/categories/:categoryId", categoryController.update)
protectedRouter.delete("/api/admin/categories/:categoryId", categoryController.remove)

protectedRouter.post("/api/admin/colors", colorController.create)
protectedRouter.put("/api/admin/colors/:colorId", colorController.update)
protectedRouter.delete("/api/admin/colors/:colorId", colorController.remove)

protectedRouter.post("/api/admin/sizes", sizeController.create)
protectedRouter.put("/api/admin/sizes/:sizeId", sizeController.update)
protectedRouter.delete("/api/admin/sizes/:sizeId", sizeController.remove)

protectedRouter.post("/api/admin/products", productController.create)
protectedRouter.put("/api/admin/products/:productId", productController.update)
protectedRouter.delete("/api/admin/products/:productId", productController.remove)
protectedRouter.put("/api/admin/products/:productId/product-variants/:productVariantId", productController.updateProductVariant)
protectedRouter.delete("/api/admin/products/:productId/product-variants/:productVariantId", productController.removeProductVariant)

protectedRouter.post("/api/carts", cartController.create)
protectedRouter.delete("/api/carts/:cartId", cartController.remove)
protectedRouter.get("/api/carts", cartController.get)

protectedRouter.post("/api/orders", orderController.getTokenTransaction)
protectedRouter.get("/api/admin/orders", orderController.search)

export default protectedRouter