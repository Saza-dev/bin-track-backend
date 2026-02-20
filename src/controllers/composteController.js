import Composte from "../models/Composte.js";
import CompostProcess from "../models/ComposteProcess.js";
import CompostSale from "../models/ComposteSale.js";

export const addComposteEntry = async (req, res) => {
  try {
    const newComposte = new Composte(req.body);
    await newComposte.save();
    res.status(201).json({
      success: true,
      message: "Composte record saved!",
      data: newComposte,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const addCompostProcess = async (req, res) => {
  try {
    const {
      binNumber,
      workerName,
      startDate,
      initialWeight,
      endDate,
      finalWeight,
      quality,
    } = req.body;

    // Create the record
    const newProcess = new CompostProcess({
      binNumber,
      workerName,
      startDate,
      initialWeight,
      // Optional harvest data
      endDate: endDate || null,
      finalWeight: finalWeight || 0,
      quality: quality || "not ready",
    });

    await newProcess.save();

    res.status(201).json({
      success: true,
      message: "Compost process tracking record created!",
      data: newProcess,
    });
  } catch (error) {
    console.error("Compost Process Error:", error.message);

    res.status(400).json({
      success: false,
      message:
        "Could not save process data. Check bin number and required fields.",
      error: error.message,
    });
  }
};

export const addCompostSale = async (req, res) => {
  try {
    const newSale = new CompostSale(req.body);
    await newSale.save();

    res.status(201).json({
      success: true,
      message: "Sales record created!",
      data: newSale,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error processing sale. Check input values.",
      error: error.message,
    });
  }
};
