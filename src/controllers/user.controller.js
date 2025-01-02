import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplaodOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";




const registerUser = asyncHandler(async (req, res) => {

    const { fullname, username, email, password } = req.body;
    console.log("email:", email);
    console.log("username:", username);
    console.log("fullname:", fullname);
    console.log("password:", password);

    if (
        [fullname, username, email, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = User.findOne({   // if username or email exists than throw error
        $or: [ { username }, { email } ]
     })
    
     if (existingUser) {
        throw new ApiError(400, "User with email or username already exists");
     }


        const avatarLocalPath = req.files?.avatar?.[0]?.path;  // avatarLocalPath is equal to path of the avatar,, this from multer

        const coverImageLocalPath=req.files?.coverImage[0]?.path;  // coverImageLocalPath is equal to path of the coverImage,, this from multer

        console.log(avatarLocalPath);

        //If not avatar path is uploaded, throw an error
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");
        }
        
        const avatar = await uplaodOnCloudinary(avatarLocalPath);  //upload avatar on cloudinary
        const coverImage = await uplaodOnCloudinary(coverImageLocalPath);  //upload coverImage on cloudinary


        if (!avatar) {
            throw new ApiError(400, "Avatar file is required");
        }


        //create user
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase(),
        })

        //remove password and refresh token from the user object
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        //if user is not created, throw an error
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering user");
        }



    });

export { registerUser }


