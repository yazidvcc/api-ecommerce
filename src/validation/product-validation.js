import Joi from "joi"

const createProductValidation = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().required(),
    category_id: Joi.number().required(),
})

export {
    createProductValidation
}