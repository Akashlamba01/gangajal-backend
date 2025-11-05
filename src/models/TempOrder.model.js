import mongoose from "mongoose";

const TempOrderSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
      trim: true,
    },
    step: {
      type: String,
      enum: [
        "awaiting_confirmation",
        "awaiting_name",
        "awaiting_address",
        "awaiting_pincode",
        "awaiting_phone",
        "completed",
      ],
      default: "awaiting_confirmation",
    },
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    total: { type: Number, default: 0, min: 0 },
    name: { type: String, trim: true, minlength: 2 },
    address: { type: String, trim: true, minlength: 10 },
    pincode: {
      type: String,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
      trim: true,
    },
  },
  { timestamps: true }
);

TempOrderSchema.index({ phone: 1 });

const TempOrder = mongoose.model("TempOrder", TempOrderSchema);

export default TempOrder;