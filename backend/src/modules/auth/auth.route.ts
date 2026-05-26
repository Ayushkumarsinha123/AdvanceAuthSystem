import { Router, Request, Response, NextFunction } from "express";
import { authController } from "./auth.container.js";
import { registerSchema } from "./auth.schema.js";
import { success, ZodObject } from "zod";

const router = Router();

// lightweight validation middleware

const validate = (schema: ZodObject) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'validation failed',
        errors: error.errors?.map((e: any) => ({
          field: e.path[1],
          message: e.message,
        }))
      });
    }
  };
};

router.post('/register', validate(registerSchema), authController.register);

export default router;
