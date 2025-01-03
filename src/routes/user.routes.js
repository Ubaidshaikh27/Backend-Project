import {  Router } from 'express';
import { loginUser, registerUser, logoutUser, refreshAcessToken } from '../controllers/user.controller.js';

import  { upload }  from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(

    // we add a middel ware before register user and adding 2 files avatar and cover image
    upload.fields([
        {
            name: "avatar",
                maxCount: 1
            }, 
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        registerUser
);


router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAcessToken)

export default router;