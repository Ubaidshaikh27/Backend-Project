import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplaodOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

//get data from req.body
//check if the user is in the database or not
// if user exits, compare the email with the database
//if does not exist, send him to register page
//check the password with the database
//if email and password are correct, generate a tokens
//send the accestoken and refreshtoken to the user

const generateAcessAndRefreshTokens = async(userId) => {
    //userId , we have passed below in loginUser function when we call this function

    try {
       const user = await User.findById(userId)
       const accesToken=user.generateAcessToken()
       const refreshToken=user.generateRefreshToken()

         user.refreshToken=refreshToken //as we know we save refreshToken in the database,
         //it will find user by id and and in that user id it will genearte a refresh token and save it in the database

        await user.save({validateBeforeSave:false}) //validateBeforeSave is false because we are not validating the user before saving it
        return {accesToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, username, email, password } = req.body;
        

    if (
        [fullname, username, email, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser =await User.findOne({   // if username or email exists than throw error
        $or: [ { username }, { email } ]
     })
    
     if (existingUser) {
        throw new ApiError(400, "User with email or username already exists");
     }

     

        const avatarLocalPath = req.files?.avatar?.[0]?.path;  // avatarLocalPath is equal to path of the avatar,, this from multer

        // const coverImageLocalPath=req.files?.coverImage[0]?.path;  // coverImageLocalPath is equal to path of the coverImage,, this from multer
        
     //This is how req.files looks like
        // {
        //     avatar: [
        //       {
        //         fieldname: 'avatar',
        //         originalname: 'IMG_9112.JPG',
        //         encoding: '7bit',
        //         mimetype: 'image/jpeg',
        //         destination: './public/temp',
        //         filename: 'IMG_9112.JPG',
        //         path: 'public\\temp\\IMG_9112.JPG',
        //         size: 241697
        //       }
        //     ],
        //     coverImage: [
        //       {
        //         fieldname: 'coverImage',
        //         originalname: 'IMG_9112.JPG',
        //         encoding: '7bit',
        //         mimetype: 'image/jpeg',
        //         destination: './public/temp',
        //         filename: 'IMG_9112.JPG',
        //         path: 'public\\temp\\IMG_9112.JPG',
        //         size: 241697
        //       }
        //     ]
        //   }   


        let coverImageLocalPath;

        //checking we receive req.files or not,, then checking if req.files.coverImage  is an array or not,, then req.files.coverImage.length is greater than 0
        //once checks completed the coverImageLocalPath = coverImage's zeroth index path
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }


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

            console.log(user);
            
        //remove password and refresh token from the user object
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        //if user is not created, throw an error
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering user");
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered successfully")
        
        );

    });



const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if(!email && !username) {
        throw new ApiError(400, "Email or Username is required");
    }

    //find user by email or username in the database
   const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(!user){
        throw new ApiError(400, "User Does not exist");
    }

    //compare the password--- check isPasswordCorrect function in user.model.js
   const isPasswordvalid =  await user.isPasswordCorrect(password)

    //if password is not valid, throw an error
   if(!isPasswordvalid){
    throw new ApiError(401, "Invalid user credentials");
}

const {accesToken, refreshToken}= await generateAcessAndRefreshTokens(user._id)

//called the database again because, when we call database previously above, we have not saved the refreshToken in the database
//by calling the database again, the generateAcessAndRefreshTokens function,  will save the refreshToken in the database
const loggedInUser = await User.findById(user._id).
select("-password -refreshToken")

//we also use select to remove password and refreshToken in the response to the user 


//These are the options for the cookie by this cookies can be modify by server only
    const options = {
        httpOnly : true,
        secure : true
    }

//send cookies to the user
    return  res.status(200)
    .cookie("accesToken", accesToken, options)
    .cookie("refreshToken", refreshToken, options)

    .json(
        new ApiResponse(200, 
            {user: loggedInUser, accesToken, refreshToken}, 
            "User logged in successfully")
    )



})


const logoutUser = asyncHandler(async (req, res) => {

//find the user by id and set the refreshToken to undefined
   await User.findByIdAndUpdate(

    ////we are setting the refreshToken to undefined, as we know that the rereshToke is saved in our database
    
    req.user._id,

     {
        $set:{
            refreshToken: undefined
      }
      
    },
      {
       new: true
      }


     
    
    )

    //clear the cookies
    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accesToken", options)  //clear the accesToken cookie, alway pass options with it
    .clearCookie("refreshToken", options) //clear the refreshToken cookie, alway pass options with it
    .json(new ApiResponse(200, {}, "User logged out successfully"))

})

const refreshAcessToken = asyncHandler(async (req, res) => {

    //getting the refreshToken from the cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

//if refreshToken is there, we will verify it with the refreshToken secret
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
         
        //getting user refresh token from the database
        const user = await User.findById(decodedToken._id)
    
        //if there is no token, throw an error
         if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        //if the refreshToken is not equal to the refreshToken in the database, throw an error
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used") 
        }   
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accesToken, newRefreshToken}= await generateAcessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accesToken", accesToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, 
                {accesToken, refreshToken: newRefreshToken },
                "Acess token refreshed successfully"
            ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export { 
    registerUser,
     loginUser,
     logoutUser,
     refreshAcessToken
    
    };


