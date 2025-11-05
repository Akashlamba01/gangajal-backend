import { AdminUser } from "../models/Admin.model.js"
import ApiResponse from "../utils/api.responses.js"
import { config } from "../config/config.js"
import jwt from 'jsonwebtoken'

const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.headers.accesstoken

    if (!token)
      return ApiResponse.unauthorized(res, "Access or Refresh Token missing!")

    const decode = jwt.verify(token, config.secretKeyJWT)
    const user = await AdminUser.findOne({
      email: decode?.email,
      role: "admin",
    }).select("-password -verificationCode")

    if (!user) return ApiResponse.unauthorized(res, "User not found!")

    req.userData = decode
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return ApiResponse.unauthorized(res, "Access token expired!");
    } else if (error.name === "JsonWebTokenError") {
      return ApiResponse.unauthorized(res, "Invalid access token!");
    } else {
      console.error("JWT verification error:", error);
      return ApiResponse.fail(res, "Authentication failed.");
    }
  }
}

export {
  verifyJwt
}