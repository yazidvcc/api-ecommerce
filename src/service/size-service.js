import prismaClient from "../application/database.js";
import validate from "../validation/validation.js";
import ResponseError from "../error/response-error.js";
import {
    createSizeValidation,
    updateSizeValidation,
    getSizeValidation,
    searchSizeValidation
} from "../validation/size-validation.js";

const create = async (request) => {
    const size = validate(createSizeValidation, request);

    const countSize = await prismaClient.size.count({
        where: { label: size.label }
    });

    if (countSize === 1) {
        throw new ResponseError(400, "Size already exists");
    }

    return prismaClient.size.create({
        data: size,
        select: { id: true, label: true }
    });
};

const update = async (request) => {
    const size = validate(updateSizeValidation, request);

    const checkSize = await prismaClient.size.count({
        where: { id: size.id }
    });

    if (checkSize !== 1) {
        throw new ResponseError(404, "Size is not found");
    }

    const countSize = await prismaClient.size.count({
        where: {
            label: size.label,
            id: {
                not: size.id
            }
        }
    })

    if (countSize === 1) {
        throw new ResponseError(400, "Size already exists");
    }

    return prismaClient.size.update({
        where: { id: size.id },
        data: { label: size.label },
        select: { id: true, label: true }
    });
};

const get = async (sizeId) => {
    sizeId = validate(getSizeValidation, sizeId);

    const size = await prismaClient.size.findUnique({
        where: { id: sizeId },
        select: { id: true, label: true }
    });

    if (!size) {
        throw new ResponseError(404, "Size is not found");
    }

    return size;
};

const search = async (request) => {
    request = validate(searchSizeValidation, request);

    const skip = (request.page - 1) * request.size;

    const filters = [];
    if (request.label) {
        filters.push({
            label: { contains: request.label }
        });
    }

    const sizes = await prismaClient.size.findMany({
        where: { AND: filters },
        take: request.size,
        skip: skip,
        select: { id: true, label: true }
    });

    const totalItems = await prismaClient.size.count({
        where: { AND: filters }
    });

    return {
        data: sizes,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    };
};

const remove = async (sizeId) => {
    sizeId = validate(getSizeValidation, sizeId);

    const countSize = await prismaClient.size.count({
        where: { id: sizeId }
    });

    if (countSize !== 1) {
        throw new ResponseError(404, "Size is not found");
    }

    return prismaClient.size.delete({
        where: { id: sizeId }
    });
};

export default { create, update, get, search, remove };
