import mongoose from "mongoose";
import { z } from 'zod';

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Invalid time format. Use HH:mm (24-hour format)."
  });
  

export const createFlashSaleValidationSchema = z.object({
  product: z.string().min(2, "Product should have at least 2 characters"),
  saleDate: z.string().date("Invalid date"),
  startTime: timeSchema,
  endTime: timeSchema,
  purchaseableQuantity: z.number().min(1, "Purchaseable Quantity should not be less than 1"),
});

export const purchaseFlashSaleValidationSchema = z.object({
    saleId: z.string({message:"Invalid Id"}),
    quantity: z.number().min(1, "Quantity should not be less than 1")
  });


const flashSaleSchema = new mongoose.Schema({
    product: { type: String, required: true },
    stockPerSale: { type: Number, required: true, default: 200 },
    totalStock: { type: Number, required: true, default: 1000  },
    saleDate: { type: Date, required: true },//e.g "2025-03-01"
    startTime: { type: String, required: true },// e.g., "12:00"
    endTime: { type: String, required: true },// e.g., "14:00"
    saleCount: { type: Number, default: 0 }, // Track sale occurrences in a month
    purchaseableQuantity: { type: Number, default: 50 }, // Maximum Quantity a user can purchase per transaction
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const FlashSale = mongoose.model('FlashSale', flashSaleSchema);

export default FlashSale;