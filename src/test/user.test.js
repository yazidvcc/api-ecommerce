import prismaClient from "../application/database.js"
import request from "supertest"
import { web } from "../application/web.js"
import { depth } from "../application/logging.js"

jest.mock("googleapis", () => {
    return {
        google: {
            auth: {
                OAuth2: jest.fn().mockImplementation(() => ({
                    getToken: jest.fn().mockResolvedValue({
                        tokens: { access_token: "fake-token" }
                    }),
                    setCredentials: jest.fn(),
                    generateAuthUrl: jest.fn().mockReturnValue("https://accounts.google.com/o/oauth2/v2/auth")
                }))
            },
            oauth2: jest.fn().mockReturnValue({
                userinfo: {
                    get: jest.fn().mockResolvedValue({
                        data: {
                            email: "yazidkhairuloffc@gmail.com",
                            name: "yazid khairul"
                        }
                    })
                }
            })
        }
    }
})

describe("POST /api/users", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany()
    })

    it("should create a new user", async () => {
        const response = await request(web).post("/api/users")
                                .set("Accept", "application/json")
                                .send({
                                    username: "test",
                                    password: "password",
                                    email: "yazidrizal@gmail.com",
                                    confirm_password: "password",
                                    first_name: "test",
                                    last_name: "test",
                                    address: "Jalan jalan"
                                })

        depth(response.body)
    
        expect(response.status).toBe(201)
        expect(response.body.data.username).toBe("test")
        expect(response.body.data.name).toBe("test test")
        expect(response.body.data.email).toBe("yazidrizal@gmail.com")
        expect(response.body.data.address).toBe("Jalan jalan")
    })  

    it("should reject if username is already exist", async () => {
        const response = await request(web).post("/api/users")
                                .set("Accept", "application/json")
                                .send({
                                    username: "test",
                                    password: "password",
                                    email: "yazidrizal@gmail.com",
                                    confirm_password: "password",
                                    first_name: "test",
                                    last_name: "test",
                                    address: "Jalan jalan"
                                })

        const response2 = await request(web).post("/api/users")
                                .set("Accept", "application/json")
                                .send({
                                    username: "test",
                                    password: "password",
                                    email: "yazidrizal@gmail.com",
                                    confirm_password: "password",
                                    first_name: "test",
                                    last_name: "test",
                                    address: "Jalan jalan"
                                })

        depth(response2.body)
    
        expect(response2.status).toBe(400)
        expect(response2.body.errors).toBeDefined()
    })  

    it("should reject if email is already exist", async () => {
        const response = await request(web).post("/api/users")
                                .set("Accept", "application/json")
                                .send({
                                    username: "test",
                                    password: "password",
                                    email: "yazidrizal@gmail.com",
                                    confirm_password: "password",
                                    first_name: "test",
                                    last_name: "test",
                                    address: "Jalan jalan"
                                })

        const response2 = await request(web).post("/api/users")
                                .set("Accept", "application/json")
                                .send({
                                    username: "test1",
                                    password: "password1",
                                    email: "yazidrizal@gmail.com",
                                    confirm_password: "password1",
                                    first_name: "test1",
                                    last_name: "test1",
                                    address: "Jalan jalan1"
                                })

        depth(response2.body)
    
        expect(response2.status).toBe(400)
        expect(response2.body.errors).toBeDefined()
    })  

    it("should reject if confirm password not same with password", async () => {
        const response = await request(web).post("/api/users")
                                .set("Accept", "application/json")
                                .send({
                                    username: "test",
                                    password: "password",
                                    email: "yazidrizal@gmail.com",
                                    confirm_password: "blank",
                                    first_name: "test",
                                    last_name: "test",
                                    address: "Jalan jalan"
                                })

        depth(response.body)
    
        expect(response.status).toBe(400)
        expect(response.body.errors).toBeDefined()
    }) 
})

describe("GET /auth/google", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany()
    })
    
    it("should redirect to google authorization url", async () => {
        const response = await request(web).get("/auth/google")
        
        depth(response.body)
    
        expect(response.status).toBe(302)
        expect(response.header.location).toBeDefined()
    })
})

describe("GET /auth/google/callback", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany()
    })

    it("should login and create new user if not exist", async () => {
        const response = await request(web).get("/auth/google/callback?code=valid-code")
        
        depth(response.body)
    
        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe("yazid khairul")
        expect(response.header["set-cookie"]).toBeDefined()

        const user = await prismaClient.user.findUnique({
            where: {
                email: "yazidkhairuloffc@gmail.com"
            }
        })
        expect(user).toBeDefined()
        expect(user.email).toBe("yazidkhairuloffc@gmail.com")
    })

    it("should login with existing user", async () => {
        await prismaClient.user.create({
            data: {
                email: "yazidkhairuloffc@gmail.com",
                name: "yazid khairul",
                role: "CUSTOMER"
            }
        })

        const response = await request(web).get("/auth/google/callback?code=valid-code")
        
        depth(response.body)
    
        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe("yazid khairul")
        
        const count = await prismaClient.user.count({
            where: {
                email: "yazidkhairuloffc@gmail.com"
            }
        })
        expect(count).toBe(1)
    })
})

