import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '#db';
import { IAuthRepository } from './auth.interface.js';
import jwt, { Secret } from 'jsonwebtoken';
import {env} from "../../config/env.config.js";
import { signAccessToken, signRefreshToken } from '../../utils/jwt.utils.js';
import ms from 'ms';


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

  async loginLocalUser (
    email : string , 
    password: string,
    userAgent?: string | null,
    ipAddress?: string | null) : Promise<{accessToken : string; refreshToken: string; expiresAt: Date; user :any}> {
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

    // compute expiration timestanps for the sessions tracking record
    const refreshTokenDuration = String(env.REFRESH_TOKEN_EXPIRES_IN || '7d');
    const expiresAt = new Date(Date.now() + (ms as any)(refreshTokenDuration));

    // generate a temp opaque random string that we will sign as the token core
    const rawRefreshTokenSeed = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshTokenSeed).digest('hex');

    // record the active session tracking link inside postgresSQL via the repository
    const session = await this.authRepository.createSession({
      userId : user.id,
      refreshTokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    })
    
    // sign jwt tokens securely 
    const accessToken = signAccessToken({ userId: user.id , email : user.email});
    const refreshToken = signRefreshToken({ userId : user.id , email: user.email, sessionId: session.id})

    return {
      accessToken,
      refreshToken,
      expiresAt,
      user : {
        id : user.id,
        email :user.email,
      }
    }
  }
}