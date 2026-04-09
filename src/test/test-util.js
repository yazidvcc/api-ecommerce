import prismaClient from "../application/database"
import bcrypt from "bcrypt"
import request from "supertest"
import { web } from "../application/web.js"

const createTestCustomer = async () => {

    const password = await bcrypt.hash("password", 10)

    return prismaClient.user.create({
        data: {
            username: "test",
            password: password,
            email: "yazid@gmail.com",
            name: "test",
            address: "Jalan Test",
            role: "CUSTOMER"
        }
    })
}

const createTestAdmin = async () => {

    const password = await bcrypt.hash("password", 10)

    return prismaClient.user.create({
        data: {
            username: "test",
            password: password,
            email: "yazid@gmail.com",
            name: "test",
            address: "Jalan Test",
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
    for (let i = 0; i < 10; i++) {
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
    for (let i = 0; i < 10; i++) {
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
    login
}