import orderService from "../service/order-service.js"

const getDestinationAddress = async (req, res, next) => {
    try {
        const result = await orderService.getDestinationAddress(req.query.search)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const getShippingCost = async (req, res, next) => {
    try {
        const result = await orderService.getShippingCost(req.body)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const getTokenTransaction = async (req, res, next) => {
    try {
        const result = await orderService.getTokenTransaction(req.user, req.body)
        res.status(201).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const getNotification = async (req, res, next) => {
    try {
        const result = await orderService.getNotification(req.body)
        res.status(200).json(result)
    } catch (e) {
        next(e)
    }
}

const search = async (req, res, next) => {
    try {
        const result = await orderService.search(req.user, req.query)
        res.status(200).json(result)
    } catch (e) {
        next(e)
    }
}

const get = async (req, res, next) => {
    try {
        const result = await orderService.get(req.user, req.params.orderId)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const remove = async (req, res, next) => {
    try {
        const result = await orderService.remove(req.params.orderId)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

export default {
    getDestinationAddress,
    getShippingCost,
    getTokenTransaction,
    getNotification,
    search,
    get,
    remove
}