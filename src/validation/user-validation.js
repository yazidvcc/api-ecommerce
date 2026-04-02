import Joi from "joi"

const createUserValidation = Joi.object({
    username: Joi.string().max(100).required(),
    password: Joi.string().max(255).required(),
    email: Joi.string().email().max(50).required(),
    confirm_password: Joi.string().required().valid(Joi.ref("password")).messages({
        "any.only": "password and confirm password must be same"
    }),
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).required(),
    address: Joi.string().max(255).required()
})

export {
    createUserValidation
}