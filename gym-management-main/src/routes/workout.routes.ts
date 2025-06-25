import express from "express";
import { getAvailableWorkouts } from "../controllers/workout.controller";
const router = express.Router();

router.get("/available", (req, res) => {
  getAvailableWorkouts(req, res);
});

export default router;
