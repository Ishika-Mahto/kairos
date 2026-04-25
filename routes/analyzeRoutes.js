import { Router } from "express";
import { analyzeDecision } from "../controllers/analyzeController.js";

const router = Router();

router.post("/analyze", analyzeDecision);

export default router;
