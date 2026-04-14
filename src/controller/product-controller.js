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

const search = async (req, res, next) => {
    try {
        const result = await productService.search(req.query)
        res.status(200).json(result)
    } catch (e) {
        next(e)
    }
}

const get = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.productId)
        const result = await productService.get(productId)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const remove = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.productId)
        const result = await productService.remove(productId)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const updateProductVariant = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.productId)
        const productVariantId = parseInt(req.params.productVariantId)
        req.body.id = productVariantId
        req.body.product_id = productId
        const result = await productService.updateProductVariant(req.body)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const removeProductVariant = async (req, res, next) => {
    try {
        const request = {
            id: parseInt(req.params.productVariantId),
            product_id: parseInt(req.params.productId)
        }
        const result = await productService.removeProductVariant(request)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const searchProductVariant = async (req, res, next) => {
    try {
        const result = await productService.searchProductVariant(req.params.productId)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

export default {
    create,
    update,
    search,
    get,
    remove,
    updateProductVariant,
    removeProductVariant,
    searchProductVariant
}