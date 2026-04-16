import { Router } from "express";
import { creditsController } from "./credits.controller";

const router = Router();

// Marketplace
router.get("/marketplace", creditsController.getMarketplace);

// Per-farmer
router.get("/:farmerId/balance", creditsController.getBalance);
router.get("/:farmerId/transactions", creditsController.getTransactions);
router.post("/:farmerId/redeem", creditsController.redeem);

// Government action
router.post("/release", creditsController.release);

export default router;
