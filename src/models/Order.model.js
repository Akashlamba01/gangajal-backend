import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
});

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true, match: /^\d{6}$/ },
});

const OrderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: /^\d{10}$/ },
    email: { type: String, trim: true }, // optional
    address: { type: AddressSchema, required: true },
    cart: { type: [OrderItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["COD", "UPI", "Card", "Wallet"], default: "COD" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "canceled", "refunded"], default: "pending" },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for fast lookup
OrderSchema.index({ phone: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", OrderSchema);
export default Order;
