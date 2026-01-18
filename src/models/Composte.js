import mongoose from "mongoose";

const ComposteSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    location: { type: String, required: true },
    wasteType: {
      type: String,
      required: true,
      enum: ["Food", "Paper", "Polyethene", "E-Waste", "Medical Waste"],
    },
    weight: { type: Number, required: true },
  },
  { timestamps: true },
);


const Composte = mongoose.model("Compost", ComposteSchema);
export default Composte;