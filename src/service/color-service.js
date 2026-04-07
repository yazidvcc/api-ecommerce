import prismaClient from "../application/database.js";
import validate from "../validation/validation.js";
import ResponseError from "../error/response-error.js";
import {
    createColorValidation,
    updateColorValidation,
    getColorValidation,
    searchColorValidation
} from "../validation/color-validation.js";

const create = async (request) => {
    const color = validate(createColorValidation, request);

    const countColor = await prismaClient.color.count({
        where: { name: color.name }
    });

    if (countColor === 1) {
        throw new ResponseError(400, "Color already exists");
    }

    return prismaClient.color.create({
        data: color,
        select: { id: true, name: true }
    });
};

const update = async (request) => {
    const color = validate(updateColorValidation, request);

    const checkColor = await prismaClient.color.count({
        where: { id: color.id }
    });

    if (checkColor !== 1) {
        throw new ResponseError(404, "Color is not found");
    }

    const countColor = await prismaClient.color.count({
        where: {
            name: color.name,
            id: {
                not: color.id
            }   
        }
    });

    if (countColor === 1) {
        throw new ResponseError(400, "Color already exists");
    }

    return prismaClient.color.update({
        where: { id: color.id },
        data: { name: color.name },
        select: { id: true, name: true }
    });
};

const get = async (colorId) => {
    colorId = validate(getColorValidation, colorId);

    const color = await prismaClient.color.findUnique({
        where: { id: colorId },
        select: { id: true, name: true }
    });

    if (!color) {
        throw new ResponseError(404, "Color is not found");
    }

    return color;
};

const search = async (request) => {
    request = validate(searchColorValidation, request);

    const skip = (request.page - 1) * request.size;

    const filters = [];
    if (request.name) {
        filters.push({
            name: { contains: request.name }
        });
    }

    const colors = await prismaClient.color.findMany({
        where: { AND: filters },
        take: request.size,
        skip: skip,
        select: { id: true, name: true }
    });

    const totalItems = await prismaClient.color.count({
        where: { AND: filters }
    });

    return {
        data: colors,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    };
};

const remove = async (colorId) => {
    colorId = validate(getColorValidation, colorId);

    const countColor = await prismaClient.color.count({
        where: { id: colorId }
    });

    if (countColor !== 1) {
        throw new ResponseError(404, "Color is not found");
    }

    return prismaClient.color.delete({
        where: { id: colorId }
    });
};

export default { create, update, get, search, remove };
