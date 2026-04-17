import validate from "../validation/validation"
import { createCartValidation, idCartValidation } from "../validation/cart-validation"
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

const remove = async (cartId) => {
    
    cartId = validate(idCartValidation, cartId)

    const count = await prismaClient.cart.count({
        where: {
            id: cartId
        }
    })

    if (count === 0) {
        throw new ResponseError(404, "Cart is not found")
    }

    return await prismaClient.cart.delete({
        where: {
            id: cartId
        }
    })
}

const get = async (userId) => {
    return await prismaClient.cart.findMany({
        where: {
            user_id: userId
        },
        select: {
            id: true,
            quantity: true,
            productVariant: {
                select: {
                    id: true,
                    price: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            productPhotos: {
                                where: {
                                 is_main: true   
                                },
                                take: 1,
                                select: {
                                    url: true
                                }
                            }
                        }
                    },
                    color: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    size: {
                        select: {
                            id: true,
                            label: true
                        }
                    }
                }
            }
        }
    })
}

export default {
    create,
    remove,
    get
}