import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// Core middleware for browser clients and JSON request bodies.
app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    name: "KAIROS API",
    status: "ok",
    message: "Decision intelligence backend is running.",
  });
});

app.use("/", analyzeRoutes);
app.use("/", trackingRoutes);

// Centralized error shape keeps API failures predictable for the frontend.
app.use((error, _request, response, _next) => {
  const statusCode = error.statusCode || 500;

  response.status(statusCode).json({
    error: error.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`KAIROS backend listening on http://localhost:${port}`);
});
