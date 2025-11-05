import mongoose from "mongoose";
import crypto from "crypto";

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Admin" },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "admin" },
    phone: { type: String },
    password: { type: String, required: true },
    token: { type: String },
    verificationCode: { type: String }
  },
  {
    timestamps: true,
  }
);

const AdminUser = mongoose.model("Admin", adminUserSchema);

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await AdminUser.findOne({ email: "iamakashlamba01@gamil.com" });
    if (!existingAdmin) {
      const defaultPassword = crypto.createHash("md5").update("000011").digest("hex");

      await AdminUser.create({
        name: "Admin",
        email: "iamakashlamba01@gamil.com",
        password: defaultPassword,
      });

      console.log("Default admin user created.");
    } else {
      console.log("ℹDefault admin already exists.");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};

export { AdminUser, createDefaultAdmin };
