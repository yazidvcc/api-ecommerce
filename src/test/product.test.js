import request from "supertest"
import prismaClient from "../application/database"
import testUtil from "./test-util"
import { web } from "../application/web"
import { depth } from "../application/logging"

describe("POST /api/admin/products", () => {
    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.user.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
    })

    it("Should success create product", async () => {
        const adminLogin = await testUtil.login()
        const category = await testUtil.createTestCategory()
        const productVariants = await testUtil.dummyManyProductVariant()

        const response = await request(web).post("/api/admin/products")
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                name: "product 1",
                description: "description 1",
                category_id: category.id,
                product_variants: productVariants
            })

        depth(response.body)

        expect(response.status).toBe(201)
        expect(response.body.data.name).toBe("product 1")
        expect(response.body.data.description).toBe("description 1")
        expect(response.body.data.category_id).toBe(category.id)
        expect(response.body.data.productVariants).toBeDefined()
    })

    it("Should reject if name is not provided", async () => {
        const adminLogin = await testUtil.login()
        const category = await testUtil.createTestCategory()

        const response = await request(web).post("/api/admin/products")
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                description: "description 1",
                category_id: category.id
            })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

    it("Should reject if name already exist", async () => {
        const adminLogin = await testUtil.login()
        const category = await testUtil.createTestCategory()
        const product = await testUtil.createTestProduct()

        const response = await request(web).post("/api/admin/products")
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                name: product.name,
                description: "description 1",
                category_id: category.id
            })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

})

describe("PUT /api/admin/products/productId", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.user.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
    })

    it("Should success update product", async () => {
        const adminLogin = await testUtil.login()
        const product = await testUtil.createTestProduct()

        const response = await request(web).put(`/api/admin/products/${product.id}`)
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                name: "product 1",
                description: "description 1",
                category_id: product.category_id
            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe("product 1")
        expect(response.body.data.description).toBe("description 1")
        expect(response.body.data.category_id).toBe(product.category_id)
    })

    it("Should reject if category id is not found", async () => {
        const adminLogin = await testUtil.login()
        const product = await testUtil.createTestProduct()

        const response = await request(web).put(`/api/admin/products/${product.id}`)
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                name: "product 1",
                description: "description 1",
                category_id: 999
            })

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

    it("Should reject if id product is not found", async () => {
        const adminLogin = await testUtil.login()
        const product = await testUtil.createTestProduct()

        const response = await request(web).put(`/api/admin/products/999`)
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                name: "product 1",
                description: "description 1",
                category_id: product.category_id
            })

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

    it("Should success if name if same with old name", async () => {
        const adminLogin = await testUtil.login()
        const product = await testUtil.createTestProduct()

        const response = await request(web).put(`/api/admin/products/${product.id}`)
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                name: "Test",
                description: "description 1",
                category_id: product.category_id
            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe("Test")
        expect(response.body.data.description).toBe("description 1")
        expect(response.body.data.category_id).toBe(product.category_id)
    })

    it("should reject if name already exist", async () => {
        const adminLogin = await testUtil.login()
        const product = await testUtil.createTestProduct()
        const category = await testUtil.createTestCategory()
        const productVariants = await testUtil.dummyManyProductVariant()

        const createProduct = await request(web).post("/api/admin/products")
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                name: "product 1",
                description: "description 1",
                category_id: category.id,
                product_variants: productVariants
            })

        const response = await request(web).put(`/api/admin/products/${product.id}`)
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                name: "Product 1",
                description: "description 1",
                category_id: product.category_id
            })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })

})

describe("DELETE /api/admin/products/productId", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.user.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
    })

    it("Should success delete product", async () => {
        const adminLogin = await testUtil.login()
        const product = await testUtil.createTestProductVariant()

        const response = await request(web).delete(`/api/admin/products/${product.product_id}`)
            .set("Cookie", adminLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBe("OK")
    })

    it("Should reject if id product is not found", async () => {
        const adminLogin = await testUtil.login()

        const response = await request(web).delete(`/api/admin/products/99999`)
            .set("Cookie", adminLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })
})

describe("GET /api/products", () => {

    beforeEach(async () => {
        await testUtil.createTestCustomer()
        await testUtil.createManyTestProduct()
    })

    afterEach(async () => {
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
        await prismaClient.user.deleteMany()
    })

    it("Should success get products", async () => {
        const response = await request(web).get("/api/products")
                            .query({
                                page: 1,
                                size: 10,
                                name: "2"
                            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBeDefined()
        expect(response.body.paging.total_items).toBe(1)
        expect(response.body.paging.total_page).toBe(1)
    })

    it("Should success get products by gender", async () => {
        const response = await request(web).get("/api/products")
                            .query({
                                page: 1,
                                size: 10,
                                gender: "MALE"
                            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBeDefined()
        expect(response.body.paging.total_items).toBe(5)
        expect(response.body.paging.total_page).toBe(1)
    })
})

describe("PUT /api/admin/products/productId/product-variants/productVariantId", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.user.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
    })

    it("Should success update product variant", async () => {
        const adminLogin = await testUtil.login()
        const productVariant = await testUtil.createTestProductVariant()

        const response = await request(web).put(`/api/admin/products/${productVariant.product_id}/product-variants/${productVariant.id}`)
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                price: 2000000,
                stock: 50
            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.price).toBe(2000000)
        expect(response.body.data.stock).toBe(50)
    })

    it("Should reject if product variant id is not found", async () => {
        const adminLogin = await testUtil.login()
        const productVariant = await testUtil.createTestProductVariant()

        const response = await request(web).put(`/api/admin/products/${productVariant.id}/product-variants/99999`)
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                price: 2000000,
                stock: 50
            })

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

    it("Should reject stock or price is null", async () => {
        const adminLogin = await testUtil.login()
        const productVariant = await testUtil.createTestProductVariant()

        const response = await request(web).put(`/api/admin/products/${productVariant.id}/product-variants/99999`)
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .set("Content-Type", "application/json")
            .send({
                stock: 50
            })

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    })
})

describe("DELETE /api/admin/products/productId/product-variants/productVariantId", () => {

    beforeEach(async () => {
        await testUtil.createTestAdmin()
    })

    afterEach(async () => {
        await prismaClient.user.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.category.deleteMany()
    })

    it("Should success delete product variant", async () => {
        const adminLogin = await testUtil.login()
        const product = await testUtil.createTestProductVariant()

        const response = await request(web).delete(`/api/admin/products/${product.product_id}/product-variants/${product.id}`)
            .set("Cookie", adminLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data).toBe("OK")
    })

    it("Should reject if id product variant is not found", async () => {
        const adminLogin = await testUtil.login()
        const product = await testUtil.createTestProductVariant()

        const response = await request(web).delete(`/api/admin/products/${product.product_id}/product-variants/99999`)
            .set("Cookie", adminLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })
})