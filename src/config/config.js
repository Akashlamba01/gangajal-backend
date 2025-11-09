import dotenv from "dotenv"
dotenv.config()

export const config = {
  port: process.env.PORT || 8001,
  DB_URI: process.env.MONGODB_URI,
  dbURILocal: process.env.MONGODB_URI_LOCAL,
  corsOrigin: process.env.CORS_ORIGIN,

  accountSid: process.env.ACCOUNT_SID,
  authTokenTwilio: process.env.AUTH_TOKEN_TWILIO,

  fromWhatsapp: process.env.FROM_WHATSAPP,


  secretKeyJWT: process.env.ACCESS_TOKEN_SECRET,
  secretExpiryJWT: process.env.ACCESS_TOKEN_EXPIRY,
  refreshSecretJWT: process.env.REFRESH_TOKEN_SECRET,
  refreshSecretExpiryJWT: process.env.REFRESH_TOKEN_EXPIRY,

  firebase: process.env.FIREBASE_CREDENTIALS,

  maxFileSize: process.env.MAX_FILE_SIZE,
  allowFileTypes: process.env.ALLOWED_FILE_TYPES,

  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryProduct: process.env.CLOUDINARY_PRODUCT_FOLDER,
  cloudinaryProductRatting: process.env.CLOUDINARY_PRODUCT_RATTING,

  razorpayApiKey: process.env.RAZORPAY_API_KEY,
  razorpayApiSecret: process.env.RAZORPAY_API_SECRET
}