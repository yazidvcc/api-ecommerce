import validate from "../validation/validation.js"
import ResponseError from "../error/response-error.js"
import midtransClient from "midtrans-client"
import prismaClient from "../application/database.js"
import { v4 as uuid } from "uuid"
import { createOrderValidation, idOrderValidation, searchOrderValidation } from "../validation/order-validation.js"
import crypto from "crypto"

const getDestinationAddress = async (request) => {

    const requestApi = new Request(`https://tdev.kiriminaja.com/api/mitra/v6.1/addresses?search=${request}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${process.env.KIRIMINAJA_API_KEY}`
        }
    })

    const response = await fetch(requestApi)

    const result = await response.json()

    if (result.status === "error") {
        throw new ResponseError(400, result.message)
    }

    return result.data

}

const getShippingCost = async (request) => {

    const requestApi = new Request(`https://tdev.kiriminaja.com/api/mitra/v6.1/shipping_price`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-API-KEY": process.env.KIRIMINAJA_API_KEY
        },
        body: JSON.stringify({
            origin: "jjj",
            subdistrict_origin: "sss",
            destination: request.destination,
            subdistrict_destination: request.subdistrict_destination,
            weight: request.weight
        })
    })

    const response = await fetch(requestApi)

    const result = await response.json()

    if (result.status === false) {
        throw new ResponseError(400, result.message)
    }

    return result.results

}

const getTokenTransaction = async (user, request) => {

    request = validate(createOrderValidation, request)

    const order = await prismaClient.$transaction(async (tx) => {
        let total_price = 0
        let total_weight = 0

        for (const product_variant of request.product_variant) {
            let productVariant = await tx.productVariant.findUnique({
                where: {
                    id: product_variant.product_variant_id
                },
                select: {
                    stock: true,
                    price: true,
                    weight: true
                }
            })

            if (!productVariant) {
                throw new ResponseError(404, "Product variant not found")
            }

            if (productVariant.stock < product_variant.quantity) {
                throw new ResponseError(400, "Stock is not enough")
            }

            total_price += productVariant.price * product_variant.quantity
            total_weight += productVariant.weight * product_variant.quantity

            await tx.productVariant.update({
                where: {
                    id: product_variant.product_variant_id
                },
                data: {
                    stock: {
                        decrement: product_variant.quantity
                    }
                }
            })
        }

        request.id = `${user.id}-${new Date().toTimeString().split(" ")[0]}-${uuid()}`
        request.user_id = user.id
        request.address = `${request.specific_address}, ${request.full_address}`
        request.total_price = total_price
        request.total_weight = total_weight
        request.orderItems = {
            createMany: {
                data: request.product_variant
            }
        }

        delete request.product_variant
        delete request.specific_address
        delete request.full_address

        const order = await tx.order.create({
            data: request,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        return order
    })

    let parameter = {
        "transaction_details": {
            "order_id": order.id,
            "gross_amount": order.total_price + order.shipping_cost
        },
        "credit_card": {
            "secure": true
        },
        "customer_details": {
            "first_name": order.user.name,
            "last_name": "",
            "email": order.user.email,
            "phone": order.user.phone
        }
    }

    let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.SERVER_KEY_MIDTRANS
    })

    const response = await snap.createTransaction(parameter)

    return response

}

const getNotification = async (request) => {

    const hash = crypto.createHash('sha256').update(request.order_id + request.status_code + request.gross_amount + process.env.SERVER_KEY_MIDTRANS).digest('hex')

    const order = await prismaClient.order.findUnique({
        where: {
            id: request.order_id
        }
    })

    if (!order) {
        throw new ResponseError(404, "Order not found")
    }

    if (hash !== request.signature_key) {
        await prismaClient.order.update({
            where: {
                id: request.order_id
            },
            data: {
                payment_status: "FAILED",
            }
        })
        throw new ResponseError(400, "Invalid signature key")
    }

    if (request.fraud_status !== "accept") {
        await prismaClient.order.update({
            where: {
                id: request.order_id
            },
            data: {
                payment_status: "FAILED",
            }
        })
        throw new ResponseError(400, "Invalid fraud status")
    }

    if (request.transaction_status === "settlement" || request.transaction_status === "capture") {
        await prismaClient.order.update({
            where: {
                id: request.order_id
            },
            data: {
                payment_type: request.payment_type,
                payment_status: "SUCCESS"
            }
        })
    }

    if (request.transaction_status === "pending") {
        await prismaClient.order.update({
            where: {
                id: request.order_id
            },
            data: {
                payment_status: "PENDING",
            }
        })
    }

    if (request.transaction_status === "deny" || request.transaction_status === "expire" || request.transaction_status === "cancel" || request.transaction_status === "failure") {
        const productVariants = await prismaClient.orderItem.deleteMany({
            where: {
                order_id: request.order_id
            },
            select: {
                quantity: true,
                product_variant_id: true
            }
        })

        for (const productVariant of productVariants) {
            await prismaClient.productVariant.update({
                where: {
                    id: productVariant.product_variant_id
                },
                data: {
                    stock: {
                        increment: productVariant.quantity
                    }
                }
            })
        }

        await prismaClient.order.delete({
            where: {
                id: request.order_id
            }
        })
    }

    return {
        status_code: 200,
        message: "Order updated successfully"
    }

}

const search = async (user, request) => {
    
    request = validate(searchOrderValidation, request)

    const skip = (request.page - 1) * request.size

    const filters = []

    if (user.role === "CUSTOMER") {
        filters.push({
            user_id: user.id
        })
    }

    if (request.order_id) {
        filters.push({
            id: request.order_id
        })
    }

    if (request.user_email) {
        filters.push({
            user: {
                email: request.user_email
            }
        })
    }

    if (request.shipping_service) {
        filters.push({
            shipping_service: request.shipping_service
        })
    }

    if (request.status) {
        filters.push({
            status: request.status
        })
    }

    if (request.payment_status) {
        filters.push({
            payment_status: request.payment_status
        })
    }

    if (request.tracking_number) {
        filters.push({
            tracking_number: request.tracking_number
        })
    }

    if (request.product_name) {
        filters.push({
            orderItems: {
                some: {
                    productVariant: {
                        product: {
                            name: request.product_name
                        }
                    }
                }
            }
        })
    }

    if (request.created_at) {
        filters.push({
            createdAt: {
                gte: request.created_at
            }
        })
    }

    if (request.updated_at) {
        filters.push({
            updatedAt: {
                lte: request.updated_at
            }
        })
    }

    const orders = await prismaClient.order.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip,
        select: {
            id: true,
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true
                }
            },
            address: true,
            total_price: true,
            total_weight: true,
            shipping_cost: true,
            shipping_service: true,
            shipping_name: true,
            shipping_type: true,
            status: true,
            payment_status: true,
            tracking_number: true,
            orderItems: {
                select: {
                    productVariant: {
                        select: {
                            product: {
                                select: {
                                    name: true
                                }
                            },
                            size: {
                                select: {
                                    label: true
                                }
                            },
                            color: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    quantity: true
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    const totalItems = await prismaClient.order.count({
        where: {
            AND: filters
        }
    })

    return {
        data: orders,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

const get = async (user, orderId) => {
    
    orderId = validate(idOrderValidation, orderId)

    const filters = {
        id: orderId
    }

    if (user.role === "CUSTOMER") {
        filters.user_id = user.id
    }

    const order = await prismaClient.order.findFirst({
        where: filters,
        select: {
            id: true,
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true
                }
            },
            address: true,
            total_price: true,
            total_weight: true,
            shipping_cost: true,
            shipping_service: true,
            shipping_name: true,
            shipping_type: true,
            status: true,
            payment_status: true,
            tracking_number: true,
            orderItems: {
                select: {
                    productVariant: {
                        select: {
                            product: {
                                select: {
                                    name: true
                                }
                            },
                            size: {
                                select: {
                                    label: true
                                }
                            },
                            color: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    quantity: true
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (!order) {
        throw new ResponseError(404, "Order not found")
    }

    return order
}

const remove = async (orderId) => {
    
    orderId = validate(idOrderValidation, orderId)

    const order = await prismaClient.order.findFirst({
        where: {
            id: orderId,
            payment_status: "FAILED"
        }
    })

    if (!order) {
        throw new ResponseError(404, "can't remove this order")
    }

    await prismaClient.order.delete({
        where: {
            id: orderId
        }
    })

    return "Success remove this order"
}

export default {
    getDestinationAddress,
    getShippingCost,
    getTokenTransaction,
    getNotification,
    search,
    get,
    remove
}