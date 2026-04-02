import prismaClient from "../application/database"
import bcrypt from "bcrypt"

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

export default {
    createTestUser
}