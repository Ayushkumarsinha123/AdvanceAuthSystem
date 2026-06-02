import { Router, Request, Response, NextFunction } from "express";
import { authController } from "./auth.container.js";
import { registerSchema ,loginSchema} from "./auth.schema.js";
import { success, ZodObject } from "zod";
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();

// lightweight validation middleware

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
