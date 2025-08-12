import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
);

app.use(
    express.json({
        limit: "50kb", // Maximum request body size
    })
);

app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use(cookieParser());

