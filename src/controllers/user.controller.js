import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";


// Registration Controller
export const registerUser = asyncHandler(async (req, res) => {
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


// Login Controller

export const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if ([username, password].some((field) => field.trim() === "")) {
        throw new ApiError(409, "Username or Password are required");
    }
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();


    // Send the Response to the User 
    return res.status(200).cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .json(new ApiResponse(200, { ...user._doc, password: undefined, refreshToken: undefined }, "User logged in successfully"));
});

// Logout Controller
export const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Refresh Access Token Controller
export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshToken || req.header("Authorization")?.split(" ")[1] || req.body.refreshToken;
        if (!refreshToken) {
            throw new ApiError(401, "Refresh Token is not provided");
        }
        const user = await User.findOne({ refreshToken });
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false }); 
        res.status(200).cookie("accessToken", newAccessToken, { httpOnly: true, secure: true })
            .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
            .json(new ApiResponse(200, { accessToken: newAccessToken }, "Access Token refreshed successfully"));
        
    } catch (error) {
        console.error("Error refreshing access token:", error);
        throw new ApiError(500, "Error refreshing access token");
    }
});
