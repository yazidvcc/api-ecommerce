import prismaClient from "../application/database"
import bcrypt from "bcrypt"
import request from "supertest"
import { web } from "../application/web.js"

const createTestCustomer = async () => {

    const password = await bcrypt.hash("password", 10)

    return prismaClient.user.create({
        data: {
            password: password,
            email: "yazid@gmail.com",
            name: "test",
            role: "CUSTOMER"
        }
    })
}

const createTestAdmin = async () => {

    const password = await bcrypt.hash("password", 10)

    return prismaClient.user.create({
        data: {
            password: password,
            email: "yazid@gmail.com",
            name: "test",
            role: "ADMIN"
        }
    })
}

const login = async () => {
    return await request(web).post("/api/users/login")
                .set("Content-Type","application/json")
                .send({
                    email: "yazid@gmail.com",
                    password: "password"
                })
}

const createTestCategory = async () => {
    return await prismaClient.category.create({
        data: {
            name: "test"
        },
        select: {
            id: true,
            name: true
        }
    })
}

const createManyTestCategory = async () => {
    const categories = []
    for (let i = 0; i < 10; i++) {
        categories.push({
            name: `test ${i}`
        })
    }

    return await prismaClient.category.createMany({
        data: categories,
        select: {
            id: true,
            name: true
        }
    })
}

const createTestColor = async () => {
    return await prismaClient.color.create({
        data: {
            name: "Test"
        },
        select: {
            id: true,
            name: true
        }
    })
}

const createManyTestColors = async () => {
    const colors = []
    for (let i = 0; i < 6; i++) {
        colors.push({
            name: `test ${i}`
        })
    }

    return await prismaClient.color.createMany({
        data: colors,
    })
}

const createTestSize = async () => {
    return await prismaClient.size.create({
        data: {
            label: "Test"
        },
        select: {
            id: true,
            label: true
        }
    })
}

const createManyTestSizes = async () => {
    const sizes = []
    for (let i = 0; i < 6; i++) {
        sizes.push({
            label: `test ${i}`
        })
    }

    return await prismaClient.size.createMany({
        data: sizes
    })
}

const createTestProduct = async () => {

    const category = await createTestCategory()

    return await prismaClient.product.create({
        data: {
            name: "Test",
            description: "Test",
            gender: "MALE",
            category_id: category.id
        },
        select: {
            id: true,
            name: true,
            description: true,
            category_id: true
        }
    })
}

const createManyTestProduct = async () => {

    const category = await createTestCategory()
    const products = []
    for (let i = 1; i <= 10; i++) {
        let gender = "MALE"
        if (i > 5) {
            gender = "FEMALE"
        }
        products.push({
            name: `test ${i}`,
            gender: gender,
            description: `test ${i}`,
            category_id: category.id
        })
    }

    return await prismaClient.product.createMany({
        data: products
    })
}

const createTestProductVariant = async () => {
    
    const product = await createTestProduct()
    const color = await createTestColor()
    const size = await createTestSize()

    return await prismaClient.productVariant.create({
        data: {
            product_id: product.id,
            color_id: color.id,
            size_id: size.id,
            price: 100000,
            stock: 10
        },
        select: {
            id: true,
            product_id: true,
            price: true,
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
}

const createManyTestProductVariant = async () => {
    
    const category = await createTestCategory()
    const productVariants = await dummyManyProductVariant()

    return await prismaClient.product.create({
        data: {
            name: "Test",
            description: "Test Description",
            gender: "MALE",
            category_id: category.id,
            productVariants: {
                createMany: {
                    data: productVariants
                }
            }
        },
        include: {
            productVariants: true
        }
    })
}

const dummyManyProductVariant = async () => {

    await createManyTestColors()
    await createManyTestSizes()

    const colors = await prismaClient.color.findMany()
    const sizes = await prismaClient.size.findMany()

    const productVariants = []
    for (const color of colors) {
        for (const size of sizes) {
            productVariants.push({
                color_id: color.id,
                size_id: size.id,
                price: 100000,
                stock: 10
            })
        }
    }

    return productVariants

}

const createTestCart = async (userId) => {
    const productVariant = await createTestProductVariant()

    return await prismaClient.cart.create({
        data: {
            user_id: userId,
            product_variant_id: productVariant.id,
            quantity: 1
        }
    })
}

const createManyTestCarts = async (userId) => {
    const productVariants = await createManyTestProductVariant()
    const carts = []
    for (const productVariant of productVariants.productVariants) {
        carts.push({
            user_id: userId,
            product_variant_id: productVariant.id,
            quantity: 1
        })
    }

    return await prismaClient.cart.createMany({
        data: carts
    })

}

export default {
    createTestCustomer,
    createTestAdmin,
    createTestCategory,
    createManyTestCategory, 
    createTestColor,
    createManyTestColors,
    createTestSize,
    createManyTestSizes,
    createTestProduct,
    createManyTestProduct,
    createTestProductVariant,
    createManyTestProductVariant,
    createTestCart,
    createManyTestCarts,
    dummyManyProductVariant,
    login
}