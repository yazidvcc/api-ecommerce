import Joi from "joi";

const createOrderValidation = Joi.object({
    full_address: Joi.string().required(),
    specific_address: Joi.string().required(),
    shipping_cost: Joi.number().positive().required(),
    shipping_service: Joi.string().required(),
    shipping_name: Joi.string().required(),
    shipping_type: Joi.string().required(),
    product_variant: Joi.array().items(Joi.object({
        product_variant_id: Joi.number().positive().required(),
        quantity: Joi.number().positive().required()
    })).required()
})

const searchOrderValidation = Joi.object({
    order_id: Joi.string().optional(),
    user_email: Joi.string().email().optional(),
    shipping_service: Joi.string().optional(),
    status: Joi.string().valid("PENDING", "SHIPPED", "DELIVERED", "CANCELLED").optional(),
    payment_status: Joi.string().valid("PENDING", "SUCCESS", "FAILED").optional(),
    tracking_number: Joi.string().optional(),
    product_name: Joi.string().optional(),
    created_at: Joi.string().optional(),
    updated_at: Joi.string().optional(),
    page: Joi.number().min(1).default(1),
    size: Joi.number().min(1).max(100).default(10)
})

export {
    createOrderValidation,
    searchOrderValidation
}