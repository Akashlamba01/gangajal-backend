import express from "express";
import { Joi, Segments, celebrate } from "celebrate";
import { adminLogin, createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/admin.controller.js";
import { upload } from "../utils/cloudinary.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route('/login').post(
  celebrate({
    body: Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          "string.empty": "Email is required",
          "string.email": "Please enter a valid email address",
        }),
      password: Joi.string()
        .min(6)
        .required()
        .messages({
          "string.empty": "Password is required",
          "string.min": "Password must be at least 6 digits.",
        }),
    }),
  }),
  adminLogin
);

router.post(
  '/create-product',
  verifyJwt,
  upload.array("images", 5), // handle multipart/form-data first
  celebrate({
    body: Joi.object({
      name: Joi.string().trim().required(),
      description: Joi.string().trim().allow("").optional(),
      basePrice: Joi.number().min(0).required(),
      discount: Joi.number().min(0).max(100).optional(),
      taxPercentage: Joi.number().min(0).max(100).optional(),
      status: Joi.string().valid("active", "inactive").optional(),
      sku: Joi.string().trim().optional(),
    }),
  }),
  createProduct
);

router.put(
  "/update-product/:id",
  verifyJwt,
  upload.array("images", 5),
  celebrate({
    [Segments.BODY]: Joi.object({
      name: Joi.string().trim().optional(),
      description: Joi.string().trim().allow("").optional(),
      basePrice: Joi.number().min(0).optional(),
      discount: Joi.number().min(0).max(100).optional(),
      taxPercentage: Joi.number().min(0).max(100).optional(),
      status: Joi.string().valid("active", "inactive").optional(),
      sku: Joi.string().trim().optional(),
    }),
  }),
  updateProduct
);

router.delete(
  "/delete-product/:id",
  verifyJwt,
  deleteProduct
);

router.get("/get-products", verifyJwt, getProducts)

export default router