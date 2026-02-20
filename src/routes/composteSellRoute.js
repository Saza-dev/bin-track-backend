import express from "express";
import * as composteController from "../controllers/composteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, composteController.addCompostSale);

export default router;
