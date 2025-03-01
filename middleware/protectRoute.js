import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendErrorResponse } from "../utils/apiResonse.js";

const protectRoute = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return sendErrorResponse(res, 401, "Unauthorized - No Token Provided");
		}

		const token = authHeader.split(" ")[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return sendErrorResponse(res, 401, "Unauthorized - Invalid Token");
		}

		const user = await User.findById(decoded.userId).select("-password");
		if (!user) {
			return sendErrorResponse(res, 404, "User not found");
		}

		req.user = user;

		next();
	} catch (error) {
		console.log("Error in protectRoute middleware: ", error.message);
		if (error.message == 'jwt expired') return sendErrorResponse(res, 401, "Unauthorized - Session expired");
		return sendErrorResponse(res, 401, "Internal server error");
	}
};

export default protectRoute;
