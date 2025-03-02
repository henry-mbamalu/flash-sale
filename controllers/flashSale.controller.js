import FlashSale, { createFlashSaleValidationSchema, purchaseFlashSaleValidationSchema } from "../models/flashSale.model.js";
import { startSession } from "mongoose";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResonse.js";
import Purchase from "../models/purchase.model.js";
import { paginate } from "../utils/paginate.js";
import moment from "moment-timezone";
import { redis } from "../db/redis.js";

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

		const lockKey = `flash_sale_lock:${saleId}`;
		const lockTTL = 5000; // 5 seconds

		const lock = await redis.set(lockKey, "locked", "NX", "PX", lockTTL);
		if (!lock) {
			await session.abortTransaction();
			return sendErrorResponse(res, 400, "High demand, try again.");
		}
		
		const now = moment().tz("Africa/Lagos");
		const currentTime = now.format("HH:mm");
		const currentDate = moment.tz(now.format("YYYY-MM-DD"), "YYYY-MM-DD", "Africa/Lagos").toDate();
		const todayDate = now.format("YYYY-MM-DD")
		const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

		const sale = await FlashSale.findOne({ saleDate: { $gte: startOfMonth, $lt: endOfMonth }, isActive: true, _id: saleId, totalStock: { $gt: 0 } });

		if (!sale) {
			await session.abortTransaction();
			return res.status(400).json({ status: "failed", error: "Flash sale is not active" });
		}


		if (todayDate < sale.saleDate || currentTime < sale.startTime || currentTime > sale.endTime) {
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


		await FlashSale.findOneAndUpdate(
			{ _id: saleId, stockPerSale: { $gte: quantity }, totalStock: { $gte: quantity } },
			[
			  {
				$set: {
				  stockPerSale: {
					$cond: {
					  if: { $lte: ["$stockPerSale", quantity] }, // If stockPerSale is 0
					  then: {
						$cond: {
						  if: { $gte: ["$totalStock", 200] }, // If totalStock is at least 200
						  then: 200, // Reset stockPerSale to 200
						  else: { $subtract: ["$totalStock", quantity] } // Otherwise, set it to totalStock - quantity
						}
					  },
					  else: { $subtract: ["$stockPerSale", quantity] } // Otherwise, just subtract normally
					}
				  },
				  totalStock: { $subtract: ["$totalStock", quantity] }, // Reduce totalStock
				  saleCount: {
					$cond: {
					  if: { $lte: ["$stockPerSale", quantity] }, // Only increment saleCount if stockPerSale resets
					  then: { $add: ["$saleCount", 1] },
					  else: "$saleCount"
					}
				  }
				}
			  }
			],
			{ new: true, session }
		  );

		await Purchase.create([{ userId: req.user._id, quantity, saleId: sale._id }], { session });

		await redis.del(lockKey);  // Release lock after purchase
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