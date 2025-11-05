import express from "express";
import { Joi, celebrate } from "celebrate";
import { checkout, webhook } from "../controllers/whatsapp.controller.js";

const router = express.Router();

router.route("/checkout").post(
  celebrate({
    body: Joi.object({
      to: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid phone number format.",
          "string.empty": "Phone number is required.",
        }),
      cart: Joi.array().items().min(1).required()
        .messages({
          "array.min": "Cart must have at least one item.",
        }),
    }),
  }),
  checkout
);

router.route('/webhook').post(
  celebrate({
    body: Joi.object({
      From: Joi.string()
        .pattern(/^whatsapp:\+\d{10,15}$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid WhatsApp number format. Must be 'whatsapp:+<countrycode><number>'",
          "any.required": "Missing sender number (From).",
        }),
      Body: Joi.string()
        .allow("")
        .required()
        .messages({
          "any.required": "Message body (Body) is required.",
        }),
    }),
  }),
  webhook
)

export default router;
