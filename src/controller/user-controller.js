import userService from "../service/user-service.js"

const create = async (req, res, next) => {

    try {
        const result = await userService.create(req.body)
        res.status(201).json({
            data: result
        })
    } catch (e) {
        next(e)
    }

}

const google = async (req, res, next) => {
    res.redirect(userService.authorizationUrl)
}

const googleCallback = async (req, res, next) => {
    
    try {
        const result = await userService.googleAuthorized(req.query.code)
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            data: result.data
        })
    } catch (e) {
        next(e)
    }
}

const login = async (req, res, next) => {
    
    try {
        const result = await userService.login(req.body)
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({
            data: result.data
        })
    } catch (e) {
        next(e)
    }
}

const logout = async (req, res, next) => {
    
    try {
        const result = await userService.logout(req.user.id)
        res.clearCookie('token')
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
} 

const get = async (req, res, next) => {
    
    try {
        const result = await userService.get(req.user.id)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

export default {
    create,
    google,
    googleCallback,
    login,
    logout,
    get
}