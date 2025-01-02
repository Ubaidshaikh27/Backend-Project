import multer from 'multer';


//in express.js we get request.json  and response. But we did not get anything else.
//so that we can get a file from the request, we need to use multer,

//so  destination: function (req, file, cb) == request, file, callback
// 2 paramtere in callback ( cb ), 1st is error, 2nd is destination path, which mean where you want to store the file


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,"./public/temp" )
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer(
    { storage: storage }
)