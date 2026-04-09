import request from "supertest"
import prismaClient from "../application/database.js"
import testUtil from "./test-util.js"
import { web } from "../application/web.js"
import { depth } from "../application/logging.js"

describe("POST /api/admin/sizes", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.size.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success create size", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).post("/api/admin/sizes")
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    label: "XL"
                })

        depth(response.body)

        expect(response.status).toBe(201)
        expect(response.body.data.label).toBe("XL") 
    })

    it("should reject if label is empty", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).post("/api/admin/sizes")
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    label: ""
                })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined() 
    })

    it("should reject user is not admin", async () => {
        await prismaClient.user.deleteMany({})
        await testUtil.createTestCustomer()
        const userLogin = await testUtil.login()

        const response = await request(web).post("/api/admin/sizes")
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    name: ""
                })

        depth(response.body)

        expect(response.status).toBe(403)
        expect(response.body.errors).toBe("Forbidden") 
    })

})

describe("PUT /api/admin/sizes/sizeId", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.size.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success update sizes", async () => {
        const userLogin = await testUtil.login()

        const size = await testUtil.createTestSize()

        const response = await request(web).put(`/api/admin/sizes/${size.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    label: "L"
                })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.label).toBe("L")
    })

    it("should reject if size is not found", async () => {
        const userLogin = await testUtil.login()

        const size = await testUtil.createTestSize()

        const response = await request(web).put(`/api/admin/sizes/99999`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    label: "L"
                })

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if label size is number", async () => {
        const userLogin = await testUtil.login()

        const size = await testUtil.createTestSize()

        const response = await request(web).put(`/api/admin/sizes/${size.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))
                .send({
                    label: 111
                })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })
})

describe("DELETE /api/admin/sizes/sizeId", () => {
    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.size.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success delete sizes", async () => {
        const userLogin = await testUtil.login()

        const size = await testUtil.createTestSize()

        const response = await request(web).delete(`/api/admin/sizes/${size.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBe("OK")
    })

    it("should reject if size is not found", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).delete(`/api/admin/sizes/99999`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })
})

describe("GET /api/sizes/sizeId", () => {
    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.size.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success get size by id", async () => {
        const userLogin = await testUtil.login()

        const size = await testUtil.createTestSize()

        const response = await request(web).get(`/api/sizes/${size.id}`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.label).toBe(size.label)
    })  

    it("should reject if size is not found", async () => {
        const userLogin = await testUtil.login()

        const response = await request(web).get(`/api/sizes/999`)
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })
})

describe("GET /api/sizes", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.size.deleteMany({})
        await prismaClient.user.deleteMany({})
    })

    it("should success search sizes", async () => {
        const userLogin = await testUtil.login()

        const sizes = await testUtil.createManyTestSizes()

        const response = await request(web).get("/api/sizes")
                .set("Cookie", userLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(10)
        expect(response.body.paging.total_item).toBe(10)
        expect(response.body.paging.total_page).toBe(1)
    })

})