import jwt from "jsonwebtoken"
import prismaClient from "../application/database.js"

const authMiddleware = async (req, res, next) => {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            errors: "Unauthorized"
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                errors: "Unauthorized"
            })
        }

        const user = await prismaClient.user.findFirst({
            where: {
                token: token
            }
        })

        if (!user) {
            return res.status(401).json({
                errors: "Unauthorized"
            })
        }

        req.user = user
        next()
    })
}   

export default authMiddleware