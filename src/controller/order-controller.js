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
        const result = await orderService.search(req.query)
        res.status(200).json(result)
    } catch (e) {
        next(e)
    }
}

export default {
    getDestinationAddress,
    getShippingCost,
    getTokenTransaction,
    getNotification,
    search
}