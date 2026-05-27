import bcrypt from 'bcrypt';
import { User } from '#db'
import { IAuthRepository } from './auth.interface.js';
import jwt, { Secret } from 'jsonwebtoken';
import {env} from "../../config/env.config.js"


export class AuthService {
  constructor(private authRepository : IAuthRepository) {}
  async registerLocalUser(email:string, password : string): Promise<User> {
    // enforce business validation constraints
    const existingUser = await this.authRepository.findUserByEmail(email);
    if(existingUser) {
      throw new Error('an account with this email already exists.')
    }
    // hash raw credentials safely via bcrypt
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    // commit records to database cluster via repository methods
    const newUser = await this.authRepository.createUser({
      email,
      passwordHash,
      provider:'EMAIL',
    })
    return newUser;
  }

  async loginLocalUser (email : string , password: string) : Promise<{accessToken : string;user :any}> {
    // first verify if user exist in db or not
    const user = await this.authRepository.findUserByEmail(email);
    if(!user || !user.passwordHash) {
      throw new Error('invalid email or password')
    }

    // verify the raw password matches our stored bycrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if(!isPasswordValid) {
      throw new Error('invalid email or password');
    }

    const tokenPayload =  {
      userId : user.id,
      email : user.email
    };

    const accessToken = jwt.sign(tokenPayload, env.ACCESS_TOKEN_SECRET, {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      user : {
        id : user.id,
        email :user.email,
        isEmailVerified : user.isEmailVerified,
      }
    }
  }
}