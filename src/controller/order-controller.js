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

export default {
    getDestinationAddress,
    getShippingCost
}