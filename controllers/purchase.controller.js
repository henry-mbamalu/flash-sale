import Purchase from "../models/purchase.model.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResonse.js";
import { paginate } from "../utils/paginate.js";

export const getLeaderBoard = async (req, res, next) => {
	try {
		const purchases = await paginate(Purchase, req, {
			sort: { createdAt: -1 }, populate: [
				{ path: "userId", select: "-password" },
				{ path: "saleId" }
			]
		});


		if (!purchases) {
			return sendErrorResponse(res, 404, "No purchases were found")
		}


		return sendSuccessResponse(res, 200, purchases);

	} catch (error) {
		next(error);
	}
};