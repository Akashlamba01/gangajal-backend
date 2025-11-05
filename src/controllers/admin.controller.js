import { AdminUser } from "../models/Admin.model.js";
import md5 from "md5";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/api.responses.js";
import { config } from "../config/config.js";
import Product from "../models/Product.model.js";

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AdminUser.findOne({ email: email });

    if (!user || user.password !== md5(password)) {
      return ApiResponse.unknown(res, "Invalid user credentials!");
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      config.secretKeyJWT,
      { expiresIn: config.secretExpiryJWT }
    );

    // Save token in DB
    user.token = token;
    await user.save();

    return ApiResponse.successOk(res, "Login successful!", { token });
  } catch (err) {
    console.error("Admin Login Error:", err);
    return ApiResponse.fail(res, "Internal server error.", process.env.NODE_ENV === "development" ? { error: err.message } : null);
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, basePrice, discount, taxPercentage, status, sku } = req.body;
    const imageUrls = req.files?.map(file => file.path) || [];

    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return ApiResponse.unknown(res, "SKU already exists.");
      }
    }

    const product = await Product.create({
      name,
      description,
      images: imageUrls,
      basePrice,
      discount,
      taxPercentage,
      status: status || "active",
      sku,
    });

    return ApiResponse.successOk(res, "Product created successfully!", product);
  } catch (err) {
    console.error("❌ Create Product Error:", err);
    return ApiResponse.fail(res, "Internal server error.", process.env.NODE_ENV === "development" ? { error: err.message } : null);
  }
}

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, basePrice, discount, taxPercentage, status, sku } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return ApiResponse.notFound(res, "Product not found.");
    }

    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return ApiResponse.unknown(res, "SKU already exists.");
      }
      product.sku = sku;
    }

    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map((file) => file.path);
      product.images = imageUrls;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (basePrice !== undefined) product.basePrice = basePrice;
    if (discount !== undefined) product.discount = discount;
    if (taxPercentage !== undefined) product.taxPercentage = taxPercentage;
    if (status) product.status = status;

    await product.save();

    return ApiResponse.successOk(res, "Product updated successfully!", product);
  } catch (err) {
    console.error("Update Product Error:", err);
    return ApiResponse.fail(res, "Internal server error.", process.env.NODE_ENV === "development" ? { error: err.message } : null);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return ApiResponse.notFound(res, "Product not found.");
    }

    await Product.findByIdAndDelete(id);

    return ApiResponse.successOk(res, "Product deleted successfully!");
  } catch (err) {
    console.error("Delete Product Error:", err);
    return ApiResponse.fail(res, "Internal server error.", process.env.NODE_ENV === "development" ? { error: err.message } : null);
  }
};

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

export {
  adminLogin,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts
}