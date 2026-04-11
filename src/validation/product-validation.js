import Joi from "joi"

const createProductValidation = Joi.object({
    name: Joi.string().max(100).required(),
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
    description: Joi.string().required(),
    category_id: Joi.number().required()
})

export {
    createProductValidation,
    updateProductValidation
}