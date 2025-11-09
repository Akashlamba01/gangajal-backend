import express from "express";
import { Joi, celebrate } from "celebrate";
import { getProducts, checkout, paymentVerification } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/listing", getProducts)
router.post('/checkout', checkout)
router.post('/paymentverification', paymentVerification)

export default router