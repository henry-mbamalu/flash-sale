import express from "express";
import { createFlashSale, purchaseFlashSale, getActiveFlashSales } from "../controllers/flashSale.controller.js";
import protectRoute from '../middleware/protectRoute.js'
import isAdmin from '../middleware/isAdmin.js'
import { purchaseRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/",protectRoute,isAdmin,createFlashSale);
router.post("/purchase",protectRoute, purchaseRateLimiter,purchaseFlashSale);
router.get("/",protectRoute,getActiveFlashSales);


export default router;