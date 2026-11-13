import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { register } from "../controllers/register.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth(), me);

export default router;
