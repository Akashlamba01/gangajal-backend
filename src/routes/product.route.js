import express from "express";
import { Joi, Segments, celebrate } from "celebrate";
import { adminLogin, createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/admin.controller.js";
import { upload } from "../utils/cloudinary.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/listing", getProducts)

export default router