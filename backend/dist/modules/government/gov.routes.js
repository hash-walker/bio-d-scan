"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gov_controller_1 = require("./gov.controller");
const router = (0, express_1.Router)();
router.get("/overview", gov_controller_1.govController.getOverview);
router.get("/farmers/:farmerId", gov_controller_1.govController.getFarmerDetails);
exports.default = router;
//# sourceMappingURL=gov.routes.js.map