import mongoose, { Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,   //cloudinary video url
            required: true,
        },
        thumbnail:{
            type: String,   //cloudinary image url
            required: true,
        },
        title:{
            type: String,   
            required: true,
        },
        description:{
            type: String,   
            required: true,
        },
        duration:{
            type: Number,   //cloudinary image url
            required: true,
        },
        views:{
            type: Number,   
            default: 0,
        },
        usPublishedL:{
            type: Boolean,   
            default: true,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },

{
    timestamps: true
}
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema)