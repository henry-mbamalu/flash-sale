import { sendErrorResponse } from "../utils/apiResonse.js";

const isAdmin = async (req, res, next) => {
	try {

		if (req.user.role != "admin") {
			return sendErrorResponse(res, 403,"You dont have permission")
		}

		next();
	} catch (error) {
		console.log("Error in isAdmin middleware: ", error.message);
		return sendErrorResponse(res, 500,"Internal server error")
	}
};

export default isAdmin;