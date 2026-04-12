import { request } from "express"
import prismaClient from "../application/database"
import ResponseError from "../error/response-error"
import { createProductValidation, idProductValidation, updateProductValidation, updateProductVariantValidation } from "../validation/product-validation"
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

const update = async (request) => {
    request = validate(updateProductValidation, request)

    const countProduct = await prismaClient.product.count({
        where: {
            id: request.id
        }
    })

    if (countProduct === 0) {
        throw new ResponseError(404, "Product not found")
    }

    const countCategory = await prismaClient.category.count({
        where: {
            id: request.category_id
        }
    })

    if (countCategory === 0) {
        throw new ResponseError(404, "Category not found")
    }

    const countProductName = await prismaClient.product.count({
        where: {
            AND: [
                { name: request.name },
                {
                    id: {
                        not: request.id
                    }
                }
            ]
        }
    })

    if (countProductName > 0) {
        throw new ResponseError(400, "Product name already exists")
    }

    return await prismaClient.product.update({
        where: {
            id: request.id
        },
        data: {
            ...request,
            updatedAt: new Date()
        },
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

const remove = async (productId) => {
    
    productId = validate(idProductValidation, productId)

    await prismaClient.$transaction(async (tx) => {
        const countProduct = await tx.product.count({
            where: {
                id: productId
            }
        })

        if (countProduct === 0) {
            throw new ResponseError(404, "Product not found")
        }

        return await tx.product.delete({
            where: {
                id: productId
            }
        })
    })

    return "OK"
}

const updateProductVariant = async (request) => {
    
    request = validate(updateProductVariantValidation, request)

    const result =  await prismaClient.$transaction(async (tx) => {
        const countProductVariant = await tx.productVariant.count({
            where: {
                AND: [
                    { id: request.id },
                    { product_id: request.product_id }
                ]
            }
        })

        if (countProductVariant === 0) {
            throw new ResponseError(404, "Product variant not found")
        }

        return await tx.productVariant.update({
            where: {
                id: request.id
            },
            data: {
                price: request.price,
                stock: request.stock,
                updatedAt: new Date()
            },
            select: {
                id: true,
                product_id: true,
                color_id: true,
                size_id: true,
                price: true,
                stock: true
            }
        })
    })

    return result
}

export default {
    create,
    update,
    remove,
    updateProductVariant
}