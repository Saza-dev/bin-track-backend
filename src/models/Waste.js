import mongoose from "mongoose";

const WasteCategorySchema = new mongoose.Schema(
  {
    weight: { type: Number, default: 0 },
    destination: {
      type: String,
      enum: ["recycling", "composte", "landfilling"],
      required: true,
    },
  },
  { _id: false },
); 

const WasteSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    collectionTime: { type: String, required: true }, 
    collectorName: { type: String, required: true }, 
    location: {
      type: String,
      required: true,
      enum: [
        "Entrance / Guard Room",
        "Research Building",
        "Academic Complex",
        "Medical Center",
        "Hub 1",
        "Hub 2",
        "Student Center",
        "Tissue Culture Lab",
        "Music Department",
        "Main Cafeteria",
        "Main Building",
      ],
    },
    weights: {
      food: { type: WasteCategorySchema, required: true },
      papper: { type: WasteCategorySchema, required: true },
      polyethene: { type: WasteCategorySchema, required: true },
      eWaste: { type: WasteCategorySchema, required: true },
      medicalWaste: { type: WasteCategorySchema, required: true },
    },
  },
  { timestamps: true },
);

const Waste = mongoose.model("Waste", WasteSchema);
export default Waste;
