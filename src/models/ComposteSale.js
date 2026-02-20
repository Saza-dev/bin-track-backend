import mongoose from "mongoose";

const CompostSaleSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    releasedPerson: { type: String, required: true },
    weight: { type: Number, required: true, min: 0 },
    vehicleNumber: { type: String, required: true },
    pricePerKg: { type: Number, required: true, min: 0 },
    actualIncome: { type: Number, required: true },
  },
  { timestamps: true },
);

const CompostSale = mongoose.model("CompostSale", CompostSaleSchema);
export default CompostSale;
