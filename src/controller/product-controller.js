import productService from "../service/product-service"

const create = async (req, res, next) => {
    try {
        const result = await productService.create(req.body)
        res.status(201).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const update = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.productId)
        req.body.id = productId
        const result = await productService.update(req.body)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}
export default {
    create,
    update
}