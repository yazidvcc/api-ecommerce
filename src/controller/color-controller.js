import colorService from "../service/color-service.js";

const create = async (req, res, next) => {
    try {
        const result = await colorService.create(req.body);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const update = async (req, res, next) => {
    try {
        const colorId = req.params.colorId;
        req.body.id = parseInt(colorId);

        const result = await colorService.update(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const get = async (req, res, next) => {
    try {
        const colorId = req.params.colorId;
        const result = await colorService.get(parseInt(colorId));
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

        const result = await colorService.search(request);
        res.status(200).json({
            data: result.data,
            paging: result.paging
        });
    } catch (e) {
        next(e);
    }
};

const remove = async (req, res, next) => {
    try {
        const colorId = req.params.colorId;
        await colorService.remove(parseInt(colorId));
        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
};

export default { create, update, get, search, remove };
