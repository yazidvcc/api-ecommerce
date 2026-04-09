import prismaClient from "../application/database"
import ResponseError from "../error/response-error"
import { createProductValidation } from "../validation/product-validation"
import validate from "../validation/validation"

const create = async (request) => {
    
    request = validate(createProductValidation, request)

    const countProduct = await prismaClient.product.count({
        where: {
            name: request.name
        }
    })

    if (countProduct > 0) {
        throw new ResponseError(400, "Product already exists")
    }

    request.productVariants = {
        createMany: {
            data: request.product_variants
        }
    }

    request.product_variants = undefined

    return await prismaClient.product.create({
        data: request,
        select: {
            id: true,
            name: true,
            description: true,
            category_id: true,
            createdAt: true,
            updatedAt: true,
            productVariants: true
        }
    })
}

export default {
    create
}