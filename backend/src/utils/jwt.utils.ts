import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';

export interface ITokenPayload {
  userId : string,
  email : string;
}

export const signAccessToken = (payload : ITokenPayload) : string => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn :env.ACCESS_TOKEN_EXPIRES_IN
  });
};

export const signRefreshToken = (payload : ITokenPayload & {sessionId : string}) : string => {
  return jwt.sign(payload , env.REFRESH_TOKEN_SECRET, {
    expiresIn : env.REFRESH_TOKEN_EXPIRES_IN
  });
}

export const verifyRefreshToken = (token: string) : ITokenPayload & {sessionId : string} =>{
  return jwt.verify(token,  env.REFRESH_TOKEN_SECRET) as ITokenPayload & { sessionId : string}
}