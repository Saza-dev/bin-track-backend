import express from "express";
import * as wasteController from "../controllers/wasteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add-waste", protect, wasteController.addWasteData);

export default router;
