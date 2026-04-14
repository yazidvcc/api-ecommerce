import Joi from "joi"

const createProductValidation = Joi.object({
    name: Joi.string().max(100).required(),
    gender: Joi.string().valid("MALE", "FEMALE", "UNISEX").required(),
    description: Joi.string().required(),
    category_id: Joi.number().required(),
    product_variants: Joi.array().items(Joi.object({
        color_id: Joi.number().positive().required(),
        size_id: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
        stock: Joi.number().positive().required()
    })).required()
})

const updateProductValidation = Joi.object({
    id: Joi.number().positive().required(),
    name: Joi.string().max(100).required(),
    gender: Joi.string().valid("MALE", "FEMALE", "UNISEX").required(),
    description: Joi.string().required(),
    category_id: Joi.number().required()
})

const searchProductValidation = Joi.object({
    category_id: Joi.number().positive().optional(),
    name: Joi.string().optional(),
    gender: Joi.string().valid("MALE", "FEMALE", "UNISEX").optional(),
    page: Joi.number().min(1).default(1).optional(),
    size: Joi.number().min(1).default(20).optional()
})

const idProductValidation = Joi.number().positive().required()

const updateProductVariantValidation = Joi.object({
    id: Joi.number().positive().required(),
    product_id: Joi.number().positive().required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().positive().required()
})

const removeProductVariantValidation = Joi.object({
    id: Joi.number().positive().required(),
    product_id: Joi.number().positive().required()
})

export {
    createProductValidation,
    updateProductValidation,
    searchProductValidation,
    idProductValidation,
    updateProductVariantValidation,
    removeProductVariantValidation
}