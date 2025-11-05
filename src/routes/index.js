import { Router } from "express"
import whatsappRoute from './whatsapp.route.js'
import adminRoute from './admin.route.js'
import productRoute from './product.route.js'
const router = Router()

router.use("/whatsapp", whatsappRoute)
router.use("/admin", adminRoute)
router.use('/products', productRoute)

export default router
