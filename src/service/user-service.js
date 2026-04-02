import prismaClient from "../application/database.js"
import ResponseError from "../error/response-error.js"
import validate from "../validation/validation.js"
import bcrypt from "bcrypt"
import { createUserValidation } from "../validation/user-validation.js"
import { google } from "googleapis"
import jwt from "jsonwebtoken"

const oauth2client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
)

const scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

const authorizationUrl = oauth2client.generateAuthUrl({
    access_type: "offline",
    scope: scope,
    include_granted_scopes: true
})

const create = async (request) => {

    request = validate(createUserValidation, request)

    const count = await prismaClient.user.count({
        where: {
            OR: [
                { username: request.username },
                { email: request.email }
            ]
        }
    })

    if (count > 0) {
        throw new ResponseError(400, "username or password is already exist")
    }
    
    request.password = await bcrypt.hash(request.password, 10)
    request.name = request.first_name + " " + request.last_name
    request.role = "CUSTOMER"

    request.first_name = undefined
    request.last_name = undefined
    request.confirm_password = undefined

    return await prismaClient.user.create({
        data: request,
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            address: true,
        }
    })
}

const googleAuthorized = async (code) => {
    
    const {tokens} = await oauth2client.getToken(code)
    oauth2client.setCredentials(tokens)

    const oauth2 = google.oauth2({
        version: "v2",
        auth: oauth2client
    })

    const {data} = await oauth2.userinfo.get()

    if (!data.email || !data.name) {
        throw new ResponseError(400, "user not found")
    }

    console.info(data.email)

    let user = await prismaClient.user.findUnique({
        where: {
            email: data.email
        }
    })

    if (!user) {
        user = await prismaClient.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: "CUSTOMER"
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        })
    }

    const token = jwt.sign(
        {
            id: user.id,
            name: user.name
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

    return {
        data: {
            id: user.id,
            name: user.name
        },
        token: token
    }
}

export default {
    create,
    authorizationUrl,
    googleAuthorized
}