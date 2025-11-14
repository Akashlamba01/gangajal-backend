import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const orderConfirmTemplate = (orderData) => {
  const {
    customerName,
    phone,
    email,
    address,
    cart,
    totalAmount,
    paymentMethod,
    paymentStatus,
    status
  } = orderData;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">

        <div style="background: #d97706; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Pure Gangajal</h1>
          <p style="margin: 0; font-size: 14px;">Order Confirmation</p>
        </div>

        <div style="padding: 20px;">
          <h2>Hello ${customerName},</h2>
          <p>Thank you for your order! Your Pure Gangajal will be delivered soon.</p>

          <h3 style="margin-top: 25px;">📦 Order Details</h3>

          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px; border-bottom: 2px solid #eee;">Product</th>
                <th style="text-align: center; padding: 8px; border-bottom: 2px solid #eee;">Qty</th>
                <th style="text-align: right; padding: 8px; border-bottom: 2px solid #eee;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${cart
      .map(
        (item) => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #f1f1f1;">${item.name}</td>
                  <td style="padding: 8px; text-align: center; border-bottom: 1px solid #f1f1f1;">${item.qty}</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f1f1;">₹${item.price}</td>
                </tr>
              `
      )
      .join("")}
            </tbody>
          </table>

          <h3 style="margin-top: 25px;">💰 Payment Summary</h3>
          <p><strong>Order ID:</strong> order_${orderData._id}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus}</p>
          <p><strong>Order Status:</strong> ${status}</p>
          <p><strong>Estimated Delivery:</strong> ${'3–5 Business Days'}</p>

          <h3 style="margin-top: 25px;">📍 Delivery Address</h3>
          <p>
            ${address.street}, ${address.landmark ? address.landmark + ", " : ""}
            ${address.city}, ${address.dist}, ${address.state} - ${address.pincode}
          </p>

          <h3 style="margin-top: 25px;">📞 Contact Info</h3>
          <p><strong>Phone:</strong> +91-${phone}</p>
          <p><strong>Email:</strong> ${email}</p>


          <h3 style="margin-top: 25px;">📞 Company Support</h3>
          <p>
            <strong>WhatsApp / Call:</strong> +91-7037585801<br/>
            <strong>Email:</strong> support@puregangajal.com
          </p>
        </div>

        <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 14px; color: #555;">
          Thank you for choosing <strong>Pure Gangajal</strong>.<br />
          We ensure purity with every drop.
        </div>

      </div>
    </div>
  `
}

const sendEmail = async (to, subject, html) => {
  try {
    console.log("Email called =>", config.emailUser, config.emailPass);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    });

    const mailOptions = {
      from: `"Pure Gangajal" <${config.emailUser}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email error =>", error);
    console.error("Email error =>", error.message);
    throw error;
  }
};

export { sendEmail, orderConfirmTemplate };