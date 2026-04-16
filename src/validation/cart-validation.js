import Joi from "joi"

const createCartValidation = Joi.object({
    product_variant_id: Joi.number().positive().required(),
    quantity: Joi.number().positive().default(1).optional()
})

export {
    createCartValidation
}