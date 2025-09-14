import dotenv from "dotenv";
import { app } from "./app.js";
import connectToDatabase from "./db/connection.js";

dotenv.config({
    path: "./.env",
});

connectToDatabase().then(() => {
    app.on("error", () => {
        console.log("Error in server connection");
    });
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running on port 3000");
    });
});
