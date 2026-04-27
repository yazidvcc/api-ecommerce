import Joi from "joi"

const createUserValidation = Joi.object({
    email: Joi.string().email().max(50).required(),
    password: Joi.string().max(255).required(),
    confirm_password: Joi.string().required().valid(Joi.ref("password")).messages({
        "any.only": "password and confirm password must be same"
    }),
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).required()
})

const loginUserValidation = Joi.object({
    email: Joi.string().email().max(50).required(),
    password: Joi.string().max(255).required()
})

export {
    createUserValidation,
    loginUserValidation
}