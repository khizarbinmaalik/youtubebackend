import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";



export async function uploadFile(path) {
    try {
        // Configuration
        cloudinary.config({
            cloud_name: 'dwqhwnap8',
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Upload file on cloudinary
        const uploadResult = await cloudinary.uploader.upload(path, {
            resource_type: "auto",
        });
        // Remove file from local storage
        fs.unlinkSync(path);
        return uploadResult;
    } catch (error) {
        console.error("Error uploading file:", error);
        fs.unlinkSync(path);
        return null;
    }
} 