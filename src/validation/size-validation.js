import Joi from "joi";

const createSizeValidation = Joi.object({
    label: Joi.string().max(100).required()
});

const updateSizeValidation = Joi.object({
    id: Joi.number().positive().required(),
    label: Joi.string().max(100).required()
});

const getSizeValidation = Joi.number().positive().required();

const searchSizeValidation = Joi.object({
    label: Joi.string().max(100).optional(),
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10)
});

export {
    createSizeValidation,
    updateSizeValidation,
    getSizeValidation,
    searchSizeValidation
};
