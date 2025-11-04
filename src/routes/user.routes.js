import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { logoutUser } from "../controllers/user.controller.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(
    loginUser
);

router.route("/logout").post(
    verifyToken,
    logoutUser
);
export default router;
