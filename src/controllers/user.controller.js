import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
export const registerUser = asyncHandler(async (req, res, next) => {
    const { username, email, fullName, password } = req.body;

    if (
        [username, email, fullName, password].some(
            (field) => field.trim() == ""
        )
    ) {
        throw new ApiError(409, "All the Fields are Required");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    const avatarLocalPath = req.files.avatar ? req.files.avatar[0].path : null;
    const coverImageLocalPath = req.files.coverImage
        ? req.files.coverImage[0].path
        : null;
    if (existedUser) {
        if (avatarLocalPath) {
            fs.unlinkSync(avatarLocalPath);
        }
        if (coverImageLocalPath) {
            fs.unlinkSync(coverImageLocalPath);
        }
        throw new ApiError(409, "Username or Email already exists");
    }
    if (!avatarLocalPath) {
        throw new ApiError(409, "Avatar is required");
    }
    const uploadResult = await uploadFile(avatarLocalPath);
    const coverImageUploadResult = coverImageLocalPath
        ? await uploadFile(coverImageLocalPath)
        : null;

    if (!uploadResult) {
        throw new ApiError(500, "Error uploading avatar");
    }
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: uploadResult.url,
        coverImage: coverImageUploadResult ? coverImageUploadResult.url : "",
    });

    const responseUser = await User.findById(user._id).select("-password -refreshToken");
    if (!responseUser) {
        throw new ApiError(500, "Unable to fetch user after creation");
    }
    res.status(201).json(new ApiResponse(201, responseUser, "User registered successfully"));
});
