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

export default {
    create
}