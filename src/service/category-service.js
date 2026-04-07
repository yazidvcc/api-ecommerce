import prismaClient from "../application/database.js";
import validate from "../validation/validation.js";
import ResponseError from "../error/response-error.js";
import {
    createCategoryValidation,
    updateCategoryValidation,
    getCategoryValidation,
    searchCategoryValidation
} from "../validation/category-validation.js";

const create = async (request) => {
    const category = validate(createCategoryValidation, request);

    const countCategory = await prismaClient.category.count({
        where: { name: category.name }
    });

    if (countCategory === 1) {
        throw new ResponseError(400, "Category already exists");
    }

    return prismaClient.category.create({
        data: category,
        select: { id: true, name: true }
    });
};

const update = async (request) => {
    const category = validate(updateCategoryValidation, request);

    const checkCategory = await prismaClient.category.count({
        where: { id: category.id }
    });

    if (checkCategory !== 1) {
        throw new ResponseError(404, "Category is not found");
    }

    const checkCategoryName = await prismaClient.category.count({
        where: { name: category.name }
    });

    if (checkCategoryName === 1) {
        throw new ResponseError(400, "Category already exists");
    }

    return prismaClient.category.update({
        where: { id: category.id },
        data: { name: category.name },
        select: { id: true, name: true }
    });
};

const get = async (categoryId) => {
    categoryId = validate(getCategoryValidation, categoryId);

    const category = await prismaClient.category.findUnique({
        where: { id: categoryId },
        select: { id: true, name: true }
    });

    if (!category) {
        throw new ResponseError(404, "Category is not found");
    }

    return category;
};

const search = async (request) => {
    request = validate(searchCategoryValidation, request);

    const skip = (request.page - 1) * request.size;

    const filters = [];
    if (request.name) {
        filters.push({
            name: { contains: request.name }
        });
    }

    const categories = await prismaClient.category.findMany({
        where: { AND: filters },
        take: request.size,
        skip: skip,
        select: { id: true, name: true }
    });

    const totalItems = await prismaClient.category.count({
        where: { AND: filters }
    });

    return {
        data: categories,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    };
};

const remove = async (categoryId) => {
    categoryId = validate(getCategoryValidation, categoryId);

    const countCategory = await prismaClient.category.count({
        where: { id: categoryId }
    });

    if (countCategory !== 1) {
        throw new ResponseError(404, "Category is not found");
    }

    return prismaClient.category.delete({
        where: { id: categoryId }
    });
};

export default { create, update, get, search, remove };
