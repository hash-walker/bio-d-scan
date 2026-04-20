"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_1 = require("../../middleware/validate");
const auth_schema_1 = require("./auth.schema");
const auth_middleware_1 = require("./auth.middleware");
const router = (0, express_1.Router)();
router.post("/login", (0, validate_1.validate)(auth_schema_1.LoginSchema), auth_controller_1.authController.login);
router.post("/register/farmer", (0, validate_1.validate)(auth_schema_1.RegisterFarmerSchema), auth_controller_1.authController.registerFarmer);
router.post("/register/government", (0, validate_1.validate)(auth_schema_1.RegisterGovernmentSchema), auth_controller_1.authController.registerGovernment);
router.get("/me", auth_middleware_1.requireAuth, auth_controller_1.authController.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map