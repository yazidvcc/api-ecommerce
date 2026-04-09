import sizeService from "../service/size-service.js";

const create = async (req, res, next) => {
    try {
        const result = await sizeService.create(req.body);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const update = async (req, res, next) => {
    try {
        const sizeId = req.params.sizeId;
        req.body.id = parseInt(sizeId);

        const result = await sizeService.update(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const get = async (req, res, next) => {
    try {
        const sizeId = req.params.sizeId;
        const result = await sizeService.get(parseInt(sizeId));
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
            label: req.query.label,
            page: req.query.page,
            size: req.query.size
        };

        const result = await sizeService.search(request);
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
        const sizeId = req.params.sizeId;
        await sizeService.remove(parseInt(sizeId));
        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
};

export default { create, update, get, search, remove };
