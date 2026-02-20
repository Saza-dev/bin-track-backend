import cors from "cors";
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import wasteRoutes from "./routes/wasteRoutes.js";
import composteRoutes from "./routes/composteRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import composteProcessingRoute from "./routes/composteProcessingRoute.js";
import composteSellRoute from "./routes/composteSellRoute.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  }),
);

// 2. Middleware
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/composte", composteRoutes);
app.use("/api/compost-process", composteProcessingRoute);
app.use("/api/compost-sales", composteSellRoute);
app.use("/api/analytics", analyticsRoutes);

export default app;
