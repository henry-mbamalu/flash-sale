import FlashSale from "../models/flashSale.model.js";
import moment from "moment-timezone";

export const updateFlashSaleStatus = async () => {
    try {
        console.log('******')
        const now = moment().tz("Africa/Lagos");
        const currentTime = now.format("HH:mm");
        const currentDate = now.startOf("day").toDate();

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Fetch today's sale
        const sales = await FlashSale.find({
            saleDate: { $gte: startOfMonth, $lt: endOfMonth }
        });
        
        if (!sales.length) return;
        console.log(currentTime)
        for (const sale of sales) {
            if (currentTime >= sale.startTime && currentTime < sale.endTime && sale.totalStock !== 0) {
                // Activate flash sale
                sale.isActive = true;
                await sale.save();
                console.log(`Flash sale started for ${sale.saleDate}!`);
            } else if (currentTime < sale.startTime || currentTime >= sale.endTime || sale.totalStock === 0) {
                // Deactivate flash sale
                sale.isActive = false;
                await sale.save();
                console.log(`Flash sale ended for ${sale.saleDate}!`);
            }
            
        }
    } catch (error) {
        console.error("Error updating flash sale status:", error);
    }
};

