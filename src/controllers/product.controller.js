import { config } from "../config/config.js";
import Product from "../models/Product.model.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import ApiResponse from "../utils/api.responses.js";
import Order from "../models/Order.model.js";

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

    const {
      fullName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      dist,
      landmark,
      cart,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status
    } = req.body;

    const newCart = cart.map(item => {
      return {
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty
      };
    })

    const orderData = await Order.create({
      customerName: fullName,
      phone,
      email,
      address: { street: address, city, state, dist, pincode, landmark },
      cart: newCart,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status
    });

    if (paymentMethod === 'COD') {
      const updatedOrder = await Order.findByIdAndUpdate(orderData._id, { status: 'confirmed' });
      return ApiResponse.successOk(res, "Checkout data received successfully", updatedOrder);
    }

    const options = {
      amount: Number(totalAmount * 100),
      currency: "INR",
      receipt: `order_rcptid_${orderData._id}`,
      notes: {
        orderId: orderData._id.toString(),
        customerName: fullName,
        phone,
        email,
      },
    };

    const razorOrder = await instance.orders.create(options);
    console.log(razorOrder, 'this is order');
    return ApiResponse.successOk(res, "Order created successfully", {
      razorOrder,
      orderData
    });
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