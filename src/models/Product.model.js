import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    images: { type: [String], default: [] },
    basePrice: { type: Number },
    discount: { type: Number, default: 0 },
    taxPercentage: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    sku: { type: String, unique: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
