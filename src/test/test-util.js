import prismaClient from "../application/database"
import bcrypt from "bcrypt"
import request from "supertest"
import { web } from "../application/web.js"

const createTestUser = async () => {

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

const login = async () => {
    return await request(web).post("/api/users/login")
                .set("Content-Type","application/json")
                .send({
                    email: "yazid@gmail.com",
                    password: "password"
                })
}

export default {
    createTestUser,
    login
}