import testUtil from "./test-util"
import request from "supertest"
import { web } from "../application/web"
import prismaClient from "../application/database"
import { depth } from "../application/logging"
import crypto from "crypto"

async function createTestOrder(quantity) {
    const login = await testUtil.loginCustomer()
    const product = await testUtil.createManyTestProductVariant()

    let productVariant = product.productVariants.map(p => {
        return {
            product_variant_id: p.id,
            quantity: quantity
        }
    }).slice(0,2)

    return await request(web).post("/api/orders")
        .set("Cookie", login.get("Set-Cookie"))
        .set("Content-Type", "application/json")
        .send({
            full_address: "Jalan jalan",
            specific_address: "Kota Medan",
            shipping_cost: 23000,
            shipping_service: "jne",
            shipping_name: "regular",
            shipping_type: "reg23",
            product_variant: productVariant
        })
}

describe("POST /api/orders", () => {

    beforeEach(async () => {
        await prismaClient.orderItem.deleteMany()
        await prismaClient.order.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.user.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.category.deleteMany()
        await testUtil.createTestCustomer()
    })

    it("should success create order", async () => {
        const order = await createTestOrder(5)

        depth(order.body)

        expect(order.status).toBe(201)
        expect(order.body.data.token).toBeDefined()
        expect(order.body.data.redirect_url).toBeDefined()
    })

    it("should reject if stock is not enough", async () => {
        const order = await createTestOrder(15)

        depth(order.body)

        expect(order.status).toBe(400)
        expect(order.body.errors).toBeDefined()
    })

})

describe("POST /api/orders/notification", () => {

    beforeEach(async () => {
        await prismaClient.orderItem.deleteMany()
        await prismaClient.order.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.user.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.category.deleteMany()
        await testUtil.createTestCustomer()
    })

    it("should success update status order", async () => {
        const order = await createTestOrder(5)

        const orderData = await prismaClient.order.findFirst()

        const signatureKey = crypto.createHash('sha256').update(orderData.id + "200" + (orderData.total_price + orderData.shipping_cost) + process.env.SERVER_KEY_MIDTRANS).digest('hex')

        const response = await request(web).post("/api/orders/notification")
            .set("Content-Type", "application/json")
            .send({
                "va_numbers": [
                    {
                        "va_number": "333333333333333",
                        "bank": "bca"
                    }
                ],
                "transaction_time": "2021-06-23 11:27:20",
                "transaction_status": "settlement",
                "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
                "status_message": "midtrans payment notification",
                "status_code": "200",
                "signature_key": signatureKey,
                "settlement_time": "2021-06-23 11:27:50",
                "payment_type": "bank_transfer",
                "payment_amounts": [],
                "order_id": orderData.id,
                "merchant_id": "G141532850",
                "gross_amount": orderData.total_price + orderData.shipping_cost,
                "fraud_status": "accept",
                "currency": "IDR"
            })

        const orderData2 = await prismaClient.order.findFirst()

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.message).toBeDefined()
        expect(orderData2.payment_status).toBe("SUCCESS")
        expect(orderData2.payment_type).toBe("bank_transfer")
    }, 10000)

    it("should reject if signature key is invalid", async () => {
        
        const order = await createTestOrder(5)

        const orderData = await prismaClient.order.findFirst()

        const response = await request(web).post("/api/orders/notification")
            .set("Content-Type", "application/json")
            .send({
                "va_numbers": [
                    {
                        "va_number": "333333333333333",
                        "bank": "bca"
                    }
                ],
                "transaction_time": "2021-06-23 11:27:20",
                "transaction_status": "settlement",
                "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
                "status_message": "midtrans payment notification",
                "status_code": "200",
                "signature_key": "invalid",
                "settlement_time": "2021-06-23 11:27:50",
                "payment_type": "bank_transfer",
                "payment_amounts": [],
                "order_id": orderData.id,
                "merchant_id": "G141532850",
                "gross_amount": orderData.total_price + orderData.shipping_cost,
                "fraud_status": "accept",
                "currency": "IDR"
            })

        const orderData2 = await prismaClient.order.findFirst()

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
        expect(orderData2.payment_status).toBe("FAILED")

    })

    it("should reject if fraud status is invalid", async () => {
        
        const order = await createTestOrder(5)

        const orderData = await prismaClient.order.findFirst()

        const signatureKey = crypto.createHash('sha256').update(orderData.id + "200" + (orderData.total_price + orderData.shipping_cost) + process.env.SERVER_KEY_MIDTRANS).digest('hex')

        const response = await request(web).post("/api/orders/notification")
            .set("Content-Type", "application/json")
            .send({
                "va_numbers": [
                    {
                        "va_number": "333333333333333",
                        "bank": "bca"
                    }
                ],
                "transaction_time": "2021-06-23 11:27:20",
                "transaction_status": "settlement",
                "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
                "status_message": "midtrans payment notification",
                "status_code": "200",
                "signature_key": signatureKey,
                "settlement_time": "2021-06-23 11:27:50",
                "payment_type": "bank_transfer",
                "payment_amounts": [],
                "order_id": orderData.id,
                "merchant_id": "G141532850",
                "gross_amount": orderData.total_price + orderData.shipping_cost,
                "fraud_status": "invalid",
                "currency": "IDR"
            })

        const orderData2 = await prismaClient.order.findFirst()

        depth(response.body)

        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
        expect(orderData2.payment_status).toBe("FAILED")
    })

    it("should reject if order id is invalid", async () => {
        
        const order = await createTestOrder(5)

        const orderData = await prismaClient.order.findFirst()

        const signatureKey = crypto.createHash('sha256').update(orderData.id + "200" + (orderData.total_price + orderData.shipping_cost) + process.env.SERVER_KEY_MIDTRANS).digest('hex')

        const response = await request(web).post("/api/orders/notification")
            .set("Content-Type", "application/json")
            .send({
                "va_numbers": [
                    {
                        "va_number": "333333333333333",
                        "bank": "bca"
                    }
                ],
                "transaction_time": "2021-06-23 11:27:20",
                "transaction_status": "settlement",
                "transaction_id": "9aed5972-5b6a-401e-894b-a32c91ed1a3a",
                "status_message": "midtrans payment notification",
                "status_code": "200",
                "signature_key": signatureKey,
                "settlement_time": "2021-06-23 11:27:50",
                "payment_type": "bank_transfer",
                "payment_amounts": [],
                "order_id": "invalid",
                "merchant_id": "G141532850",
                "gross_amount": orderData.total_price + orderData.shipping_cost,
                "fraud_status": "accept",
                "currency": "IDR"
            })

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    })

})

describe("GET /api/orders", () => {

    beforeEach(async () => {
        await prismaClient.orderItem.deleteMany()
        await prismaClient.order.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.user.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.category.deleteMany()
        await testUtil.createTestCustomer()
        await testUtil.createTestAdmin()
    })

    it("should success get all orders", async () => {

        const adminLogin = await testUtil.loginAdmin()

        for (let i = 0; i < 3; i++) {
            const order = await createTestOrder(2)
        }

        const response = await request(web).get("/api/orders")
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .query({
                page: 1,
                size: 10
            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.paging.total_item).toBe(3)
    },10000)

    it("should success get all orders by shipping service", async () => {

        const adminLogin = await testUtil.loginAdmin()

        for (let i = 0; i < 3; i++) {
            const order = await createTestOrder(2)
        }

        const response = await request(web).get("/api/orders")
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .query({
                page: 1,
                size: 10,
                shipping_service: "jne"
            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.paging.total_item).toBe(3)
    },10000)

    it("should success get all orders by user email", async () => {

        const adminLogin = await testUtil.loginAdmin()

        for (let i = 0; i < 3; i++) {
            const order = await createTestOrder(2)
        }

        const response = await request(web).get("/api/orders")
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .query({
                page: 1,
                size: 10,
                user_email: "yazidCustomer@gmail.com"
            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.paging.total_item).toBe(3)
    },10000)

    it("should success get all orders by ", async () => {

        const adminLogin = await testUtil.loginAdmin()

        for (let i = 0; i < 3; i++) {
            const order = await createTestOrder(2)
        }

        const response = await request(web).get("/api/orders")
            .set("Cookie", adminLogin.get("Set-Cookie"))
            .query({
                page: 1,
                size: 10,
                product_name: "test"
            })

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.paging.total_item).toBe(3)
    },10000)


})

describe("GET /api/orders/orderId", () => {

    beforeEach(async () => {
        await prismaClient.orderItem.deleteMany()
        await prismaClient.order.deleteMany()
        await prismaClient.productVariant.deleteMany()
        await prismaClient.product.deleteMany()
        await prismaClient.user.deleteMany()
        await prismaClient.color.deleteMany()
        await prismaClient.size.deleteMany()
        await prismaClient.category.deleteMany()
        await testUtil.createTestCustomer()
        await testUtil.createTestAdmin()
    })

    it("should success get orders by admin", async () => {

        const adminLogin = await testUtil.loginAdmin()

        const order = await createTestOrder(2)

        const dataOrder = await prismaClient.order.findFirst()

        const response = await request(web).get(`/api/orders/${dataOrder.id}`)
            .set("Cookie", adminLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(dataOrder.id)
    },10000)

    it("should success get orders by customer", async () => {

        const customerLogin = await testUtil.loginCustomer()

        const order = await createTestOrder(2)

        const dataOrder = await prismaClient.order.findFirst()

        const response = await request(web).get(`/api/orders/${dataOrder.id}`)
            .set("Cookie", customerLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(200)
        expect(response.body.data.id).toBe(dataOrder.id)
    },10000)

    it("should reject if order id is invalid", async () => {

        const adminLogin = await testUtil.loginAdmin()

        const order = await createTestOrder(2)

        const response = await request(web).get(`/api/orders/invalid`)
            .set("Cookie", adminLogin.get("Set-Cookie"))

        depth(response.body)

        expect(response.status).toBe(404)
        expect(response.body.errors).toBeDefined()
    },10000)


})