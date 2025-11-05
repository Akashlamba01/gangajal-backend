import ApiResponse from "../utils/api.responses.js";
import twilio from "twilio";
import Order from "../models/Order.model.js";
import TempOrder from "../models/TempOrder.model.js";
import { config } from "../config/config.js";
import Product from "../models/Product.model.js";

const accountSid = config.accountSid
const authToken = config.authTokenTwilio;
const client = twilio(accountSid, authToken);

const checkout = async (req, res) => {
  try {
    const { to, cart } = req.body;

    console.log(to, cart)

    if (!to || !Array.isArray(cart) || cart.length === 0) {
      return ApiResponse.unknown(res, "Missing or invalid 'to' or 'cart' data.");
    }

    const productList = cart
      .map((item, index) => `*${index + 1}.* ${item.name} — ₹${item.price} × ${item.qty} = ₹${item.price * item.qty}`)
      .join("\n");

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const cartIds = cart.map(item => item.id)
    const products = await Product.find({ _id: { $in: cartIds } })

    if (products.length != cartIds.length) {
      return ApiResponse.fail(res, "Somting was wrong in product selection!")
    }

    await TempOrder.findOneAndUpdate(
      { phone: to },
      { phone: to, step: "awaiting_confirmation", cartIds, total, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const msg = `
      🙏 *Hello!*
      Thank you for choosing *Pure Gangajal*. 🙌

      Here’s your order summary:

      ${productList}

      *Total Amount:* ₹${total}

      To confirm your order, reply with *confirm*
      Or reply *cancel* to cancel.

      We’ll contact you shortly for delivery details once confirmed. 🚚💧`
      .trim();

    await client.messages.create({
      from: config.fromWhatsapp,
      to: `whatsapp:+91${to}`,
      body: msg,
    });

    console.info(`✅ Checkout message sent to ${to}`);
    return ApiResponse.successOk(res, "Checkout initiated via WhatsApp.");

  } catch (err) {
    console.error("Checkout Error:", err);
    return ApiResponse.fail(
      res,
      "Internal Server Error. Please try again later.",
      process.env.NODE_ENV === "development" ? { error: err.message } : null
    );
  }
};

const webhook = async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();
  console.log(req.body, 'requtsisssssssssss')

  try {
    const incomingMsg = req.body.Body?.trim();
    const from = req.body.From?.replace("whatsapp:+91", "");

    if (!from || !incomingMsg) {
      twiml.message("⚠️ Invalid request. Please send a valid message.");
      return res.type("text/xml").send(twiml.toString());
    }

    const user = await TempOrder.findOne({ phone: from });

    if (!user) {
      twiml.message(
        "👋 Namaste! Please start your order from the *Pure Gangajal* website first."
      );
      return res.type("text/xml").send(twiml.toString());
    }

    const saveUser = async () => await user.save();

    const stepHandlers = {
      awaiting_confirmation: async () => {
        const msg = incomingMsg.toLowerCase();
        if (msg === "confirm") {
          user.step = "awaiting_name";
          await saveUser();
          twiml.message("✅ Order confirmed! Please send your *Full Name*:");
        } else if (msg === "cancel") {
          twiml.message("❌ Order canceled. Jai Ganga Maiya 🙏");
          await TempOrder.deleteOne({ phone: from });
        } else {
          twiml.message("Please reply with *confirm* ✅ or *cancel* ❌.");
        }
      },

      awaiting_name: async () => {
        const name = incomingMsg;
        if (!name || name.length < 2) {
          twiml.message("⚠️ Please enter a valid *Full Name*.");
        } else {
          user.name = name;
          user.step = "awaiting_address";
          await saveUser();
          twiml.message(
            "📍 Please enter your *Full Address* (including city & state):"
          );
        }
      },

      awaiting_address: async () => {
        const address = incomingMsg;
        if (address.length < 10 || !address.includes(",")) {
          twiml.message(
            "⚠️ Please enter a more complete address including street, city, and state."
          );
        } else {
          user.address = address;
          user.step = "awaiting_pincode";
          await saveUser();
          twiml.message("📮 Please enter your *Pincode*:");
        }
      },

      awaiting_pincode: async () => {
        const pincode = incomingMsg;
        if (!/^\d{6}$/.test(pincode)) {
          twiml.message("⚠️ Please enter a valid 6-digit *Pincode*.");
        } else {
          user.pincode = pincode;
          user.step = "awaiting_phone";
          await saveUser();
          twiml.message("📞 Please enter your *Phone Number*:");
        }
      },

      awaiting_phone: async () => {
        const phone = incomingMsg;
        if (!/^\d{10}$/.test(phone)) {
          twiml.message("⚠️ Please enter a valid 10-digit *Phone Number*.");
        } else {
          user.phone = phone;
          user.step = "completed";
          await saveUser();

          // Save final order
          const order = await Order.create({
            name: user.name,
            address: user.address,
            pincode: user.pincode,
            phone: user.phone,
            cart: user.cart || [],
            status: "confirmed",
            createdAt: new Date(),
          });

          const productList =
            user.cart
              ?.map(
                (item) =>
                  `• ${item.name} — ₹${item.basePrice} × ${item.qty} = ₹${item.basePrice * item.qty
                  }`
              )
              .join("\n") || "No products listed.";

          const total =
            user.cart?.reduce((sum, i) => sum + i.basePrice * i.qty, 0) || 0;

          twiml.message(
            [
              `🎉 *Order Confirmed!*`,
              ``,
              `🧴 *Your Order Details:*`,
              productList,
              ``,
              `💰 *Total:* ₹${total}`,
              ``,
              `👤 *Name:* ${user.name}`,
              `🏠 *Address:* ${user.address}`,
              `📮 *Pincode:* ${user.pincode}`,
              `📞 *Phone:* ${user.phone}`,
              ``,
              `🙏 Thank you for choosing *Pure Gangajal*!`,
              `Our team will contact you soon for delivery. 🚚💧`,
            ].join("\n")
          );

          // Remove temp state
          await TempOrder.deleteOne({ phone: from });
        }
      },
    };

    // Execute step handler
    if (stepHandlers[user.step]) {
      await stepHandlers[user.step]();
    } else {
      twiml.message(
        "⚠️ Something went wrong. Please restart your order on our website."
      );
      await TempOrder.deleteOne({ phone: from });
    }

    res.type("text/xml").send(twiml.toString());
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    twiml.message(
      "⚠️ Sorry, something went wrong on our side. Please try again later."
    );
    res.type("text/xml").send(twiml.toString());
  }
};

export {
  checkout,
  webhook
}