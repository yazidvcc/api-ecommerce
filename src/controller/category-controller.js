import categoryService from "../service/category-service.js";

const create = async (req, res, next) => {
    try {
        const result = await categoryService.create(req.body);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const update = async (req, res, next) => {
    try {
        req.body.id = parseInt(req.params.categoryId);

        const result = await categoryService.update(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const get = async (req, res, next) => {
    try {
        const result = await categoryService.get(parseInt(req.params.categoryId));
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const search = async (req, res, next) => {
    try {
        const request = {
            name: req.query.name,
            page: req.query.page,
            size: req.query.size
        };

        const result = await categoryService.search(request);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

const remove = async (req, res, next) => {
    try {
        await categoryService.remove(parseInt(req.params.categoryId));
        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
};

export default { create, update, get, search, remove };
