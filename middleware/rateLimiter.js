import { redis } from "../db/redis.js";
import { sendErrorResponse } from "../utils/apiResonse.js";

export const purchaseRateLimiter = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
        return sendErrorResponse(res, 401, "Unauthorized - No User ID");
    }

    const userId = req.user._id.toString();
    const key = `purchase_limit_${userId}`;
    const windowMs = 20 * 1000; // 20 secs window
    const maxPurchases = 1; // Limit to 1 purchase per 20 secs

    // Check current request count
    let requestCount = await redis.get(key);
    requestCount = requestCount ? parseInt(requestCount) : 0;

    if (requestCount >= maxPurchases) {
        return sendErrorResponse(res, 429, "Too many purchase attempts. Try again later.");
    }

    // Increment request count
    await redis.setex(key, windowMs / 1000, requestCount + 1);

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    return sendErrorResponse(res, 500, "Server error");
  }
};