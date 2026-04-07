import request from "supertest"
import prismaClient from "../application/database.js"
import testUtil from "./test-util.js"
import { web } from "../application/web.js"
import { depth } from "../application/logging.js"

describe("POST /api/categories", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.category.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success create category", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).post("/api/admin/categories")
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: "Baju"
                })

        depth(response.body)

        expect(response.status).toBe(201)
        expect(response.body.data.name).toBe("Baju") 
    })

    it("should reject if name is empty", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).post("/api/admin/categories")
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

        const response = await request(web).post("/api/admin/categories")
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: ""
                })

        depth(response.body)

        expect(response.status).toBe(403)
        expect(response.body.errors).toBe("Forbidden") 
    })

})

describe("PUT /api/admin/categories/categoryId", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.category.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success update categories", async () => {
        const userLogin = await testUtil.login()

        const category = await testUtil.createTestCategory()

        const response = await request(web).put(`/api/admin/categories/${category.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: "Celana"
                })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe("Celana")
    })

    it("should reject if category is not found", async () => {
        const userLogin = await testUtil.login()

        const category = await testUtil.createTestCategory()

        const response = await request(web).put(`/api/admin/categories/haha`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: "Celana"
                })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if name category is number", async () => {
        const userLogin = await testUtil.login()

        const category = await testUtil.createTestCategory()

        const response = await request(web).put(`/api/admin/categories/${category.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: 111
                })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })
})

describe("DELETE /api/admin/categories/categoryId", () => {
    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.category.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success delete categories", async () => {
        const userLogin = await testUtil.login()

        const category = await testUtil.createTestCategory()

        const response = await request(web).delete(`/api/admin/categories/${category.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBe("OK")
    })

    it("should reject if category is not found", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).delete(`/api/admin/categories/haha`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })
})

describe("GET /api/admin/categories/categoryId", () => {
    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.category.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success get categoriy by id", async () => {
        const userLogin = await testUtil.login()

        const category = await testUtil.createTestCategory()

        const response = await request(web).get(`/api/categories/${category.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe(category.name)
    })

    it("should reject if category is not found", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).get(`/api/categories/999`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })
})

describe("GET /api/categories", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.category.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success search categories", async () => {
        const userLogin = await testUtil.login()

        const categories = await testUtil.createManyTestCategory()

        const response = await request(web).get("/api/categories")
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(10)
        expect(response.body.paging.total_item).toBe(10)
        expect(response.body.paging.total_page).toBe(1)
    })

})