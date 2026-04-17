import cartService from "../service/cart-service.js"

const create = async (req, res, next) => {
    try {
        const result = await cartService.create(req.user.id, req.body)
        res.status(201).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const remove = async (req, res, next) => {
    try {
        const result = await cartService.remove(req.params.cartId)
        res.status(200).json({
            data: "OK"
        })
    } catch (e) {
        next(e)
    }
}

const get = async (req, res, next) => {
    try {
        const result = await cartService.get(req.user.id)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

export default {
    create,
    remove,
    get
}