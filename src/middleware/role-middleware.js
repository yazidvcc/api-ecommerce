const roleMiddleware = async (req, res, next) => {

    if (req.path.startsWith("/api/admin")) {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                errors: "Forbidden"
            })
        }
        next()
    }

    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({
            errors: "Forbidden"
        })
    }
    next()
}

export default roleMiddleware