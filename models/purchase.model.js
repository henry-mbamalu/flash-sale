import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    saleId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'FlashSale' },
    quantity: { type: Number, required: true },
    purchaseTime: { type: Date, default: Date.now }
  }, { timestamps: true });
  
  const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;