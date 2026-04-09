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