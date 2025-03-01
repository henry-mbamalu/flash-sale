import express from "express";
import { getLeaderBoard } from "../controllers/purchase.controller.js";
import protectRoute from '../middleware/protectRoute.js'
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/leader-board", protectRoute, isAdmin, getLeaderBoard);



export default router;