import cors from "cors";
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import wasteRoutes from "./routes/wasteRoutes.js";
import composteRoutes from "./routes/composteRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js"

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/composte", composteRoutes);
app.use("/api/analytics", analyticsRoutes)

export default app;
