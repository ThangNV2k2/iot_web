import express from "express";
import IotController from "./iot.controller";
const router = express.Router();

router.get("/healthCheck", IotController.healthCheck);
router.get("/statisticals", IotController.getStatisticalList);
router.post("/save", IotController.saveStatisticals);
router.post("/save-milestone", IotController.updateMilestone);
router.get("/milestones", IotController.getMilestoneList);
router.get("/milestones/:device_id", IotController.getMilestoneById);
router.post("/save-base-station", IotController.saveBaseStation);
router.get("/base-station", IotController.getBaseStation);
export default router;
