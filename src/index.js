// import dotenv from "dotenv"
// dotenv.config()
import connectDB from "./db/index.js"
import { app } from "./app.js"
import { config } from "./config/config.js"

const port = config.port
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("the server is running on the port:", port)
    })
  })
  .catch((err) => {
    console.log("MongoDB Connection Faild!!!", err)
  })
