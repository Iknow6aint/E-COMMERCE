const {cloudinary} = require('./cloudinary')


const deleteFile =(public_id)=>{
    return cloudinary.uploader.destroy(public_id)
}

exports.deleteFile = deleteFile;