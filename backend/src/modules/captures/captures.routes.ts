import { Router } from "express";
import { capturesController } from "./captures.controller";

const router = Router();

router.get("/", capturesController.getAll);
router.get("/stats", capturesController.getStats);
router.get("/:id", capturesController.getById);
router.post("/", capturesController.ingest);   // Alternative HTTP ingestion point

export default router;
