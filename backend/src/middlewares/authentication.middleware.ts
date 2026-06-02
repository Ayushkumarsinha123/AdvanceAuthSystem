import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import jwt from 'jsonwebtoken'
import env from "../config/env.config.js";

interface IDecodedToken {
  userId : string,
  email : string,
  iat: number,
  exp : number
}

export const requireAuth = async (req : Request, res : Response, next: NextFunction ): Promise<void> => {
      try {
       // extract the authorization header
       const authHeader = req.headers.authorization;


       // standard production formating : Bearer <token>
       if(!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new AppError('Authentication required. Please provide a valid Bearer token.', 401);
       }

       // isolate the raw token string
       const token = authHeader.split(' ')[1];

       if(!token) {
        throw new AppError('auth token missing', 401);
       }
       try {
        // verify the crypto validity using access_token_secret
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as IDecodedToken;

        req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
      next();
       } catch (jwtError: any) {
      // Catch explicit token-lifetime validation events handled by jsonwebtoken
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError('Access token has expired. Please refresh your session.', 401);
      }
      throw new AppError('Invalid or altered authentication token.', 401);
    }
  } catch (error) {
    // Route validation failures instantly out to your global handler wrapper
    next(error);
  }
    
}