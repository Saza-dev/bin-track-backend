import Waste from '../models/Waste.js';


export const addWasteData = async (req, res) => {
  try {
    const newEntry = new Waste(req.body);
    await newEntry.save();
    res.status(201).json({ 
      success: true,
      message: "Waste record saved!", 
      data: newEntry 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};


