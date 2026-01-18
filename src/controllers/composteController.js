import Composte from '../models/Composte.js';

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
