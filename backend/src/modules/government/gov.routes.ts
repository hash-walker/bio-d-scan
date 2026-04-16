import { Router } from "express";
import { govController } from "./gov.controller";

const router = Router();

router.get("/overview", govController.getOverview);
router.get("/farmers/:farmerId", govController.getFarmerDetails);

export default router;
