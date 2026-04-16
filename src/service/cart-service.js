import validate from "../validation/validation"
import { createCartValidation } from "../validation/cart-validation"
import prismaClient from "../application/database"
import ResponseError from "../error/response-error"

const create = async (userId, request) => {

    request = validate(createCartValidation, request)

    return await prismaClient.$transaction(async (tx) => {
        const productVariant = await tx.productVariant.findUnique({
            where: {
                id: request.product_variant_id
            }
        })

        if (!productVariant) {
            throw new ResponseError(404, "Product variant not found")
        }

        const cart = await tx.cart.findFirst({
            where: {
                user_id: userId,
                product_variant_id: request.product_variant_id
            }
        })

        if (cart) {
            throw new ResponseError(400, "Product variant already in cart")
        }

        return tx.cart.create({
            data: {
                user_id: userId,
                product_variant_id: request.product_variant_id,
                quantity: request.quantity
            }
        })
    })
}

export default {
    create
}