import { Router } from "express";
import { completeMissedTask, getHistory, trackTask } from "../controllers/trackingController.js";

const router = Router();

router.post("/track", trackTask);
router.patch("/track/:id/complete", completeMissedTask);
router.get("/history", getHistory);

export default router;
