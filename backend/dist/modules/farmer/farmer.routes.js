"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const farmer_controller_1 = require("./farmer.controller");
const validate_1 = require("../../middleware/validate");
const farmer_schema_1 = require("./farmer.schema");
const router = (0, express_1.Router)();
router.get("/", farmer_controller_1.farmerController.getAll);
router.post("/", (0, validate_1.validate)(farmer_schema_1.CreateFarmerSchema), farmer_controller_1.farmerController.create);
router.get("/:id", farmer_controller_1.farmerController.getById);
router.put("/:id", (0, validate_1.validate)(farmer_schema_1.UpdateFarmerSchema), farmer_controller_1.farmerController.update);
exports.default = router;
//# sourceMappingURL=farmer.routes.js.map