"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const credits_controller_1 = require("./credits.controller");
const router = (0, express_1.Router)();
// Marketplace
router.get("/marketplace", credits_controller_1.creditsController.getMarketplace);
// Per-farmer
router.get("/:farmerId/balance", credits_controller_1.creditsController.getBalance);
router.get("/:farmerId/transactions", credits_controller_1.creditsController.getTransactions);
router.post("/:farmerId/redeem", credits_controller_1.creditsController.redeem);
// Government action
router.post("/release", credits_controller_1.creditsController.release);
exports.default = router;
//# sourceMappingURL=credits.routes.js.map