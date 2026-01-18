import express from "express";
import * as composteController from "../controllers/composteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add-composte", protect, composteController.addComposteEntry);

export default router;
