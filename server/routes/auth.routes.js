import { Router } from "express";
import { register, login, logout, refresh, getMe } from "../controllers/auth.controller.js";
import { validateRegister, validateLogin } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, getMe);

export default router;
