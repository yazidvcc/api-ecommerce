import express from 'express';
import cookieParser from 'cookie-parser';
import publicRouter from '../route/public-api.js';
import errorMiddleware from '../middleware/error-middleware.js';
import expressFileUpload from 'express-fileupload'
import protectedRouter from '../route/protected-api.js';
import cors from 'cors'

const web = express();
web.use(express.json());
web.use(expressFileUpload({
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    limitHandler: (req, res, next) => {
        return res.status(413).json({
            errors: 'File terlalu besar! Maksimal ukuran adalah 2MB.'
        });
    },
    abortOnLimit: true
}))
web.use(cookieParser());
web.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
web.use(publicRouter);
web.use(protectedRouter);
web.use(errorMiddleware)

export {
    web
}