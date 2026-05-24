// src/modules/auth/auth.interface.ts
import { User, Session, PrismaClient } from '#db';

export interface ICreateUserDTO {
  email: string;
  passwordHash?: string;
  provider?: 'EMAIL' | 'GOOGLE_PROVIDER';
  isEmailVerified?: boolean;
}

export interface ICreateSessionDTO {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: ICreateUserDTO): Promise<User>;
  createSession(data: ICreateSessionDTO): Promise<Session>;
  findSessionWithUser(sessionId: string): Promise<(Session & { user: User }) | null>;
  invalidateSession(sessionId: string): Promise<void>;
}