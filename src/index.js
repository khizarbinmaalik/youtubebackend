import express from "express";
import dotenv from "dotenv";
import connectToDatabase from "./db/connection.js";
dotenv.config({
    path: "./.env",
});
connectToDatabase().then(
    () => {
        const app = express();
        app.listen(process.env.PORT, () => {
            console.log("Server is running on port 3000");
        });
    },
    (err) => {
        console.log("MONGO db connection failed !!! ", err);
    }
);


