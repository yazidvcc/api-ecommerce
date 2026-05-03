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
        const customerLogin = await testUtil.loginCustomer()
        const productVariant = await testUtil.createTestProductVariant()

        const response = await request(web).post("/api/carts")
                .set("Cookie", customerLogin.get("Set-Cookie"))
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
        const customerLogin = await testUtil.loginCustomer()

        const response = await request(web).post("/api/carts")
                .set("Cookie", customerLogin.get("Set-Cookie"))
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
        const customerLogin = await testUtil.loginCustomer()
        const cart = await testUtil.createTestCart(customerLogin.body.data.id)

        const response = await request(web).post("/api/carts")
                .set("Cookie", customerLogin.get("Set-Cookie"))
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
        const customerLogin = await testUtil.loginCustomer()
        const cart = await testUtil.createTestCart(customerLogin.body.data.id)

        const response = await request(web).delete(`/api/carts/${cart.id}`)
                .set("Cookie", customerLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBe("OK")
    })

    it("should reject if cart id not found", async () => {
        const customerLogin = await testUtil.loginCustomer()

        const response = await request(web).delete(`/api/carts/999`)
                .set("Cookie", customerLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

})

describe("GET /api/carts", () => {

    beforeEach(async () => {
        await testUtil.createTestCustomer()
    })

    afterEach(async () => {
        await prismaClient.cart.deleteMany()
        await prismaClient.user.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
    })

    it("should success get carts", async () => {
        const customerLogin = await testUtil.loginCustomer()
        await testUtil.createManyTestCarts(customerLogin.body.data.id)

        const response = await request(web).get("/api/carts")
                            .set("Cookie", customerLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBeDefined()
    })

})