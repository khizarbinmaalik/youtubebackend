import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use(
    express.json({
        limit: "50kb", // Maximum request body size
    })
);

app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use(cookieParser());

import userRoutes from "./routes/user.routes.js";

app.use("/api/v1/users", userRoutes);