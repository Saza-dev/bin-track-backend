import mongoose from "mongoose";

const WasteSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    location: {
      type: String,
      required: true,
      enum: [
        "Main Canteen",
        "Caffe",
        "Staff Room",
        "Research Building",
        "Hub 1",
        "Hub 2",
        "Medical Center",
      ],
    },
    weights: {
      food: { type: Number, default: 0 },
      papper: { type: Number, default: 0 },
      polyethene: { type: Number, default: 0 },
      eWaste: { type: Number, default: 0 },
      medicalWaste: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Waste = mongoose.model("Waste", WasteSchema);
export default Waste;