import Joi from "joi";

const createColorValidation = Joi.object({
    name: Joi.string().max(100).required()
});

const updateColorValidation = Joi.object({
    id: Joi.number().positive().required(),
    name: Joi.string().max(100).required()
});

const getColorValidation = Joi.number().positive().required();

const searchColorValidation = Joi.object({
    name: Joi.string().max(100).optional(),
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10)
});

export {
    createColorValidation,
    updateColorValidation,
    getColorValidation,
    searchColorValidation
};
