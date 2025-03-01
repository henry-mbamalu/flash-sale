import FlashSale, { createFlashSaleValidationSchema, purchaseFlashSaleValidationSchema } from "../models/flashSale.model.js";
import { startSession } from "mongoose";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResonse.js";
import Purchase from "../models/purchase.model.js";
import { paginate } from "../utils/paginate.js";
import moment from "moment-timezone";

export const createFlashSale = async (req, res, next) => {
	try {

		const { product, saleDate, startTime, endTime, purchaseableQuantity } = createFlashSaleValidationSchema.parse(req.body);
		const sale = new FlashSale({ product, startTime, saleDate, endTime, purchaseableQuantity });
		await sale.save();
		return sendSuccessResponse(res, 201, sale, 'Flash sale created successfully')
	} catch (error) {
		next(error);
	}
};


export const purchaseFlashSale = async (req, res, next) => {
	const session = await startSession();
	session.startTransaction();
	try {
		const { saleId, quantity } = purchaseFlashSaleValidationSchema.parse(req.body);
		const now = moment().tz("Africa/Lagos");
		const currentTime = now.format("HH:mm");
		const currentDate  = moment.tz(now.format("YYYY-MM-DD"), "YYYY-MM-DD", "Africa/Lagos").toDate();
		const todayDate = now.format("YYYY-MM-DD")
		const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

		const sale = await FlashSale.findOne({ saleDate: { $gte: startOfMonth, $lt: endOfMonth }, isActive: true, _id: saleId, totalStock: { $gt: 0 } });

		if (!sale) {
			await session.abortTransaction();
			return res.status(400).json({ status: "failed", error: "Flash sale is not active" });
		}

		
		if (todayDate < sale.saleDate ||currentTime < sale.startTime || currentTime > sale.endTime) {
			await session.abortTransaction();
			return res.status(400).json({ status: "failed", error: "Outside flash sale time" });
		}


		if (sale.purchaseableQuantity < quantity) {
			await session.abortTransaction();
			return sendErrorResponse(res, 400, `Maximum quantity per purchase is ${sale.purchaseableQuantity}`);
		}

		if (sale.stockPerSale < quantity) {
			await session.abortTransaction();
			return sendErrorResponse(res, 400, `Not enough stock available, available no of stock is ${sale.stockPerSale}`);
		}

	
		sale.stockPerSale -= quantity
		sale.totalStock -= quantity;
		if (sale.stockPerSale === 0 && sale.totalStock > 0) {
			sale.saleCount += 1;
			if (sale.totalStock >= 200) {
				sale.stockPerSale = 200;
			}
			else {
				sale.stockPerSale = sale.totalStock;
			}

		}

		await sale.save({ session });


		await Purchase.create([{ userId: req.user._id, quantity, saleId: sale._id }], { session });

		await session.commitTransaction();
		return sendSuccessResponse(res, 201, undefined, 'Purchase successful');
	} catch (error) {
		await session.abortTransaction();
		next(error);
	} finally {
		session.endSession();
	}
};

export const getActiveFlashSales = async (req, res, next) => {
	try {
		const now = moment().tz("Africa/Lagos");
		const currentDate = now.startOf("day").toDate();
		const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

		const activeFlashSales = await paginate(FlashSale, req, {
			sort: { createdAt: -1 }, query: {
				isActive: true,
				saleDate: { $gte: startOfMonth, $lt: endOfMonth },
				totalStock: { $gt: 0 }
			}
		})


		if (!activeFlashSales) {
			return sendErrorResponse(res, 404, "No active Flash Sales were found");
		}

		return sendSuccessResponse(res, 200, activeFlashSales.data, null, activeFlashSales.meta);
	} catch (error) {
		next(error);
	}
};