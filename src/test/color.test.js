import request from "supertest"
import prismaClient from "../application/database.js"
import testUtil from "./test-util.js"
import { web } from "../application/web.js"
import { depth } from "../application/logging.js"

describe("POST /api/admin/colors", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.color.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success create color", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).post("/api/admin/colors")
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: "Blue"
                })

        depth(response.body)

        expect(response.status).toBe(201)
        expect(response.body.data.name).toBe("Blue") 
    })

    it("should reject if name is empty", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).post("/api/admin/colors")
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: ""
                })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined() 
    })

    it("should reject user is not admin", async () => {
        await prismaClient.user.deleteMany({})
        await testUtil.createTestCustomer()
        const userLogin = await testUtil.login()

        const response = await request(web).post("/api/admin/colors")
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: ""
                })

        depth(response.body)

        expect(response.status).toBe(403)
        expect(response.body.errors).toBe("Forbidden") 
    })

})

describe("PUT /api/admin/colors/colorId", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.color.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success update colors", async () => {
        const userLogin = await testUtil.login()

        const color = await testUtil.createTestColor()

        const response = await request(web).put(`/api/admin/colors/${color.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: "Red"
                })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe("Red")
    })

    it("should reject if color is not found", async () => {
        const userLogin = await testUtil.login()

        const color = await testUtil.createTestColor()

        const response = await request(web).put(`/api/admin/colors/99999`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: "Red"
                })

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if name color is number", async () => {
        const userLogin = await testUtil.login()

        const color = await testUtil.createTestColor()

        const response = await request(web).put(`/api/admin/colors/${color.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: 111
                })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })
})

describe("DELETE /api/admin/colors/colorId", () => {
    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.color.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success delete colors", async () => {
        const userLogin = await testUtil.login()

        const color = await testUtil.createTestColor()

        const response = await request(web).delete(`/api/admin/colors/${color.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBe("OK")
    })

    it("should reject if color is not found", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).delete(`/api/admin/colors/99999`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })
})

describe("GET /api/admin/colors/colorId", () => {
    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.color.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success get colors by id", async () => {
        const userLogin = await testUtil.login()

        const color = await testUtil.createTestColor()

        const response = await request(web).get(`/api/colors/${color.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe(color.name)
    })

    it("should reject if color is not found", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).get(`/api/colors/999`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })
})

describe("GET /api/colors", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.color.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success search colors", async () => {
        const userLogin = await testUtil.login()

        const colors = await testUtil.createManyTestColors()

        const response = await request(web).get("/api/colors")
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(10)
        expect(response.body.paging.total_item).toBe(10)
        expect(response.body.paging.total_page).toBe(1)
    })

})