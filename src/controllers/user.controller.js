import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUpload.js";
import {ApiResponse} from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res, next) => {
    const { username, email, fullname, password } = req.body;

    if (
        [username, email, fullname, password].some(
            (field) => field.trim() == ""
        )
    ) {
        throw new ApiError(409, "All the Fields are Required");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "Username or Email already exists");
    }
    const avatarLocalPath = req.files.avatar ? req.files.avatar[0].path : null;
    const coverimageLocalPath = req.files.coverimage
        ? req.files.coverimage[0].path
        : null;
    if (!avatarLocalPath) {
        throw new ApiError(409, "Avatar is required");
    }
    const uploadResult = await uploadFile(avatarLocalPath);
    const coverImageUploadResult = coverimageLocalPath
        ? await uploadFile(coverimageLocalPath)
        : null;

    if (!uploadResult) {
        throw new ApiError(500, "Error uploading avatar");
    }
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: uploadResult.url,
        coverimage: coverImageUploadResult ? coverImageUploadResult.url : "",
    });

    const responseUser = await User.findById(user._id).select("-password -refreshToken");
    if (!responseUser) {
        throw new ApiError(500, "Unable to fetch user after creation");
    }
    res.status(201).json( new ApiResponse(201, responseUser, "User registered successfully"));
});
