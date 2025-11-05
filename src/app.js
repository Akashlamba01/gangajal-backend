import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { config } from "./config/config.js"
import mainRoutes from "./routes/index.js"
import { errors } from "celebrate"
// import { qrCodeGenrate } from "./controllers/auth.controller.js"

const app = express()

// app.use(
//   cors({
//     origin: config.corsOrigin,
//   })
// )

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(bodyParser.json({ limit: "16kb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("empty"))

app.get("/", (req, res) => {
  res.send("Hello, Node.js and MongoDB!")
})

app.use("/api", mainRoutes)

// to find the device
app.get("/get-devicetype", (req, res) => {
  const userAgent = req.get("User-Agent")
  // console.log(userAgent)
  if (userAgent) {
    if (/android/i.test(userAgent)) {
      req.deviceType = "Android"
    } else if (/iphone|ipod/i.test(userAgent)) {
      req.deviceType = "iOS"
    } else if (/web/i.test(userAgent)) {
      req.deviceType = "Web"
    } else {
      req.deviceType = "Unknown"
    }
  }
  return res.status(200).json({
    message: "success",
    device: req.deviceType,
  })
})

//only sample QR Code
// app.route("/qrcode").post(qrCodeGenrate)

app.use(errors())

export { app }
