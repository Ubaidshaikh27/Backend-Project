import mongoose, { Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; 

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim:true,
        index: true        //to make search faster and optimized
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim:true,
    },
    fullname:{
        type: String,
        required: true,
        trim:true,
        index: true
    },
    avatar:{
        type: String,      //cloudinary image url
        required: true,
    },
    coverImage:{
        type: String,      //cloudinary image url
    },
    watchHistory: [
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken:{
        type: String
    },
},
{
    timestamps: true
}
);

//logic to encrypt the password before we save it and make sure that the password is encrypted only when the Password is modified,
//not when we modifed the other fields
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//logic to compare the password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAcessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRES
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES
        }
    )
};

export const User = mongoose.model("User", userSchema)

