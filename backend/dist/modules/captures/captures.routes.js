"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const captures_controller_1 = require("./captures.controller");
const router = (0, express_1.Router)();
router.get("/", captures_controller_1.capturesController.getAll);
router.get("/stats", captures_controller_1.capturesController.getStats);
router.get("/:id", captures_controller_1.capturesController.getById);
router.post("/", captures_controller_1.capturesController.ingest); // Alternative HTTP ingestion point
exports.default = router;
//# sourceMappingURL=captures.routes.js.map