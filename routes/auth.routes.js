import express from "express";
import { signIn, signUp, signUpAdmin} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import isAdmin from "../middleware/isAdmin.js";


const router = express.Router();

router.post("/signup/admin",protectRoute,isAdmin,signUpAdmin);

router.post("/signup",signUp);

router.post("/signin",signIn);



export default router;