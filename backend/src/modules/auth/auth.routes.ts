import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { LoginSchema, RegisterFarmerSchema, RegisterGovernmentSchema } from "./auth.schema";
import { requireAuth } from "./auth.middleware";

const router = Router();

router.post("/login", validate(LoginSchema), authController.login);
router.post("/register/farmer", validate(RegisterFarmerSchema), authController.registerFarmer);
router.post("/register/government", validate(RegisterGovernmentSchema), authController.registerGovernment);
router.get("/me", requireAuth, authController.me);

export default router;
