import express from "express";
import { Joi, celebrate } from "celebrate";
import { getProducts, checkout, paymentVerification } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/listing", getProducts)

router.post('/checkout', celebrate({
  body: Joi.object().keys({
    fullName: Joi.string().pattern(/^[A-Za-z\s]+$/).trim().min(2).max(50).required().messages({
      "string.pattern.base": "Full name can only contain letters and spaces.",
      "string.min": "Full name must be at least 2 characters long.",
      "string.max": "Full name must be at most 50 characters long.",
      "string.empty": "Full name cannot be empty.",
      "any.required": "Full name is required.",
    }),

    phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
      "string.pattern.base": "Phone number must be a valid Indian mobile number.",
    }),
    email: Joi.string().email().optional(),
    address: Joi.string().trim().required(),
    landmark: Joi.string().trim().allow("").optional(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    dist: Joi.string().trim().required(),
    pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
      "string.pattern.base": "Pincode must be a 6-digit number.",
    }),

    cart: Joi.array().items().min(1).required().messages({
      "array.min": "Cart must have at least one item.",
    }),

    totalAmount: Joi.number().min(0).required(),
    paymentMethod: Joi.string().valid("COD", "Online").required(),
    paymentStatus: Joi.string().default("pending"),
    status: Joi.string().default("pending"),
  }),
}), checkout);

router.post('/paymentverification', paymentVerification)

export default router