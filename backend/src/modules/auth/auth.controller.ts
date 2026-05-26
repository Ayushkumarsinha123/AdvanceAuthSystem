import type {Request, Response, NextFunction} from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private authService: AuthService){}

  //using an arrow fn here automatically binds "this" so express routing  does't loss context
  register = async ( req : Request, res: Response ,next : NextFunction): Promise<void> => {
 try{
  const {email , password} = req.body;

  // call our service layer engine
  const newUser = await this.authService.registerLocalUser(email, password);

  res.status(201).json({
    success : true,
    message : "user registered successfully",
    data : {
      id : newUser.id,
      email: newUser.email,
      provider : newUser.provider,
      isEmailVerified : newUser.isEmailVerified,
      createdAt : newUser.createdAt
    },
  });
 } catch(error) {
  next(error);
 }
  }
}