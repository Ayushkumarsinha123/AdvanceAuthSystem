import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  //using an arrow fn here automatically binds "this" so express routing  does't loss context
  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      // call our service layer engine
      const newUser = await this.authService.registerLocalUser(email, password);

      res.status(201).json({
        success: true,
        message: "user registered successfully",
        data: {
          id: newUser.id,
          email: newUser.email,
          provider: newUser.provider,
          isEmailVerified: newUser.isEmailVerified,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] || null;
      const ipAddress = req.ip || null;

      // execute our login processing service
      const { accessToken, refreshToken, expiresAt, user } =
        await this.authService.loginLocalUser(
          email,
          password,
          userAgent,
          ipAddress,
        );

        // package the refresh token into a secure HTTP-ONLY cookie container
        res.cookie('refreshToken', refreshToken, {
          httpOnly  : true,
          secure : process.env.NODE_ENV === 'production',
          sameSite : 'strict',
          expires : expiresAt,
        })

      // we send the access token directly back in the JSON body
      res.status(200).json({
        success: true,
        message: "logged in successfully",
        data: {
          accessToken,
          user,
        },
      });
    } catch (error) {
      next();
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the refresh token securely from the incoming HTTP-Only cookie container
      const incomingRefreshToken = req.cookies.refreshToken;

      if (!incomingRefreshToken) {
        res.status(401).json({ success: false, message: 'Refresh token is completely missing.' });
        return;
      }

      const userAgent = req.headers['user-agent'] || null;
      const ipAddress = req.ip || null;

      // Call our rotation service core
      const { accessToken, refreshToken, expiresAt } = 
        await this.authService.rotateToken(incomingRefreshToken, userAgent, ipAddress);

      // Overwrite the old browser cookie with our fresh rotated token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: expiresAt,
      });

      res.status(200).json({
        success: true,
        message: 'Tokens rotated and session renewed successfully',
        data: { accessToken },
      });
    } catch (error: any) {
      // Clear the compromised cookie if the rotation fails for safety
      res.clearCookie('refreshToken');
      res.status(401).json({ success: false, message: error.message });
    }
  };
}
