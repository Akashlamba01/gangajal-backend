import { config } from "../config/config.js";
import Product from "../models/Product.model.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import ApiResponse from "../utils/api.responses.js";

const PAYMENT_SUCCESS_URL = "https://gangajal.onrender.com/payment-success";
// const PAYMENT_SUCCESS_URL = "http://localhost:3000/payment-success";

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return ApiResponse.successOk(res, "Products retrieved successfully!", products);
  } catch (err) {
    console.error("Get Products Error:", err);
    return ApiResponse.fail(
      res,
      "Internal server error.",
      process.env.NODE_ENV === "development" ? { error: err.message } : null
    );
  }
};

const instance = new Razorpay({
  key_id: config.razorpayApiKey,
  key_secret: config.razorpayApiSecret,
});

const checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    const order = await instance.orders.create(options);
    console.log(order, 'this is order');
    return ApiResponse.successOk(res, "Order created successfully", order);

  } catch (error) {
    console.error("Checkout Error:", error);
    return ApiResponse.fail(res,
      "Internal server error.",
      process.env.NODE_ENV === "development" ? { error: error.message } : null
    );
  }
};

const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const generatedSignature = crypto
    .createHmac("SHA256", config.razorpayApiSecret)
    .update(body.toString())
    .digest("hex");
  // console.log("sig recev: ", razorpay_signature);
  // console.log("sig gernrate: ", generatedSignature);

  const isAuthentic = generatedSignature === razorpay_signature;

  if (isAuthentic) {
    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    return res.redirect(
      `${PAYMENT_SUCCESS_URL}?reference=${razorpay_payment_id}`
    );
  } else {
    return res.status(200).json({
      success: false,
    });
  }
};


export {
  getProducts,
  checkout,
  paymentVerification
}