import mongoose from "mongoose";

const ComposteSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    collectingPerson: {
      type: String,
      required: true,
    },
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
    wasteType: {
      type: String,
      required: true,
      enum: ["Food Waste", "Gardening Waste", "Residual Waste", "Mixed Waste"],
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

// Note: Changed the model name to "Compost" for better naming conventions
const Composte = mongoose.model("Compost", ComposteSchema);
export default Composte;
