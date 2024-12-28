import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


// Configuring cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uplaodOnCloudinary = async (localFilePath) => {
    try {    
        if (!localFilePath)  return null;   //if there is no file path, return null

        // upload file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        //file has been uploaded successfully

        console.log("file is uploaded on cloudinary", response.url);
        return response
        

        
    } catch (error) {
            fs.unlinkSync(localFilePath);

            //remove the locally saved temporary file as upload operation got failed
            return null;
    }
}

export { uplaodOnCloudinary };

