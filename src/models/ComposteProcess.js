import mongoose from "mongoose";

const CompostProcessSchema = new mongoose.Schema(
  {
    binNumber: { type: String, required: true },
    workerName: { type: String, required: true },
    startDate: { type: Date, required: true },
    initialWeight: { type: Number, required: true },

    // Harvest data (may be empty if the process is ongoing)
    endDate: { type: Date },
    finalWeight: { type: Number, default: 0 },
    quality: {
      type: String,
      required: true,
      enum: ["excellent", "good", "fair", "poor", "not ready"],
      default: "not ready",
    },
  },
  { timestamps: true },
);

const CompostProcess = mongoose.model("CompostProcess", CompostProcessSchema);
export default CompostProcess;
