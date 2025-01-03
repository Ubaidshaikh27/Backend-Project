
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// _  there is a underscore because we are not using the second parameter (which was res)
//whenever we are wiriting middleware, we need to write next() in the function
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer", "")
    
    
    
        if(!token){
            throw new ApiError(401, "Unauthorized request") 
        }
        
        //verify the token
        const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET)
        
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        if (!user) {
            throw new ApiError(401, "Invalid access token")
        
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})


