import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { config } from "../config/config.js"
import multer from 'multer'

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: config.cloudinaryProduct,
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

export const upload = multer({ storage });