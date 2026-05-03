import prismaClient from "../application/database"
import ResponseError from "../error/response-error"
import { createProductValidation, idProductValidation, idProductVariantValidation, removeProductVariantValidation, searchProductValidation, updateProductValidation, updateProductVariantValidation } from "../validation/product-validation"
import validate from "../validation/validation"
import redis from "../application/redis"

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
            gender: true,
            category_id: true,
            createdAt: true,
            updatedAt: true,
            productVariants: true
        }
    })
}

const search = async (request) => {

    request = validate(searchProductValidation, request)

    const skip = (request.page - 1) * request.size

    const where = {}

    if (request.category_id) {
        where.category_id = {
            equals: request.category_id
        }
    }

    if (request.gender) {
        where.gender = {
            equals: request.gender
        }
    }

    if (request.name) {
        where.name = {
            contains: request.name
        }
    }

    const products = await prismaClient.product.findMany({
        where: where,
        skip: skip,
        take: request.size,
        orderBy: {
            createdAt: "desc"
        }
    })

    const count = await prismaClient.product.count({
        where: where
    })

    return {
        data: products,
        paging: {
            page: request.page,
            total_page: Math.ceil(count / request.size),
            total_items: count
        }

    }

}

const get = async (productId) => {

    productId = validate(idProductValidation, productId)

    const product = await prismaClient.$transaction(async (tx) => {
        const countProduct = await tx.product.count({
            where: {
                id: productId
            }
        })

        if (countProduct === 0) {
            throw new ResponseError(404, "Product not found")
        }

        return await tx.product.findUnique({
            where: {
                id: productId
            },
            select: {
                id: true,
                name: true,
                description: true,
                gender: true,
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdAt: true,
                updatedAt: true
            }
        })
    })

    return product
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

    const result = await prismaClient.$transaction(async (tx) => {
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

const removeProductVariant = async (request) => {

    request = validate(removeProductVariantValidation, request)

    const result = await prismaClient.$transaction(async (tx) => {
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

        return await tx.productVariant.delete({
            where: {
                id: request.id
            }
        })
    })

    return "OK"
}

const searchProductVariant = async (productId) => {
    
    productId = validate(idProductValidation, productId)

    const countProductVariant = await prismaClient.product.count({
        where: {
            id: productId
        }
    })

    if (countProductVariant === 0) {
        throw new ResponseError(404, "Product variant not found")
    }

    return await prismaClient.product.findUnique({
        where: {
            id: productId
        },
        select: {
            id: true,
            name: true,
            gender: true,
            description: true,
            createdAt: true,
            category: {
                select: {
                    id: true,
                    name: true
                }
            },
            productVariants: {
                select: {
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
                    },
                    price: true,
                    stock: true,
                    weight: true
                }
            }
        }
    })
}

const getProductVariant = async ( productVariantId, productId) => {
    
    productVariantId = validate(idProductVariantValidation, productVariantId)
    productId = validate(idProductValidation, productId)

    const productVariant = await prismaClient.productVariant.findFirst({
        where: {
            id: productVariantId,
            product_id: productId
        },
        select: {
            id: true,
            price: true,
            weight: true,
            stock: true,
            size: {
                select: {
                    id: true,
                    label: true
                }
            },
            color: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    if (!productVariant) {
        throw new ResponseError(404, "Product variant not found")
    }

    return productVariant

}

export default {
    create,
    update,
    remove,
    search,
    get,
    updateProductVariant,
    removeProductVariant,
    searchProductVariant,
    getProductVariant
}