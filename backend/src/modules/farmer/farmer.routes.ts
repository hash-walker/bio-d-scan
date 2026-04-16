import { Router } from "express";
import { farmerController } from "./farmer.controller";
import { validate } from "../../middleware/validate";
import { CreateFarmerSchema, UpdateFarmerSchema } from "./farmer.schema";

const router = Router();

router.get("/", farmerController.getAll);
router.post("/", validate(CreateFarmerSchema), farmerController.create);
router.get("/:id", farmerController.getById);
router.put("/:id", validate(UpdateFarmerSchema), farmerController.update);

export default router;
