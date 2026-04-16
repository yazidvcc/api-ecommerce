import testUtil from "./test-util"
import request from "supertest"
import prismaClient from "../application/database.js"
import { web } from "../application/web.js"
import { depth } from "../application/logging"

describe("POST /api/carts", () => {

    beforeEach(async () => {
        await testUtil.createTestCustomer()
    })

    afterEach(async () => {
        await prismaClient.user.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
    })

    it("should success add products to cart", async () => {
        const adminLogin = await testUtil.login()
        const productVariant = await testUtil.createTestProductVariant()

        const response = await request(web).post("/api/carts")
                .set("Cookie", adminLogin.get("Set-Cookie"))
                .set("Content-Type", "application/json")
                .send({
                    product_variant_id: productVariant.id,
                    quantity: 2
                })

        depth(response.body)

        expect(response.status).toBe(201)
        expect(response.body.data.product_variant_id).toBe(productVariant.id)
        expect(response.body.data.quantity).toBe(2)
    })

    it("should reject if product variant id not found", async () => {
        const adminLogin = await testUtil.login()

        const response = await request(web).post("/api/carts")
                .set("Cookie", adminLogin.get("Set-Cookie"))
                .set("Content-Type", "application/json")
                .send({
                    product_variant_id: 999,
                    quantity: 2
                })

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if product variant already in cart", async () => {
        const adminLogin = await testUtil.login()
        const cart = await testUtil.createTestCart(adminLogin.body.data.id)

        const response = await request(web).post("/api/carts")
                .set("Cookie", adminLogin.get("Set-Cookie"))
                .set("Content-Type", "application/json")
                .send({
                    product_variant_id: cart.product_variant_id,
                    quantity: 2
                })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

})

describe("DELETE /api/carts/cartId", () => {

    beforeEach(async () => {
        await testUtil.createTestCustomer()
    })

    afterEach(async () => {
        await prismaClient.user.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
    })

    it("should success remove products from cart", async () => {
        const adminLogin = await testUtil.login()
        const cart = await testUtil.createTestCart(adminLogin.body.data.id)

        const response = await request(web).delete(`/api/carts/${cart.id}`)
                .set("Cookie", adminLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBe("OK")
    })

    it("should reject if cart id not found", async () => {
        const adminLogin = await testUtil.login()

        const response = await request(web).delete(`/api/carts/999`)
                .set("Cookie", adminLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

})