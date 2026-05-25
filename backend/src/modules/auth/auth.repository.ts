import { prisma } from "../../lib/prisma.js"
import { User, Session } from '#db';
import { IAuthRepository, ICreateUserDTO, ICreateSessionDTO } from './auth.interface.js';

export class AuthRepository implements IAuthRepository {
  
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {email},
    })
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where : { id },
    })
  }

  async createUser(data: ICreateUserDTO): Promise<User> {
    return prisma.user.create({
      data:{
        email : data.email ,
        passwordHash : data.passwordHash,
        provider: data.provider || 'EMAIL',
        isEmailVerified : data.isEmailVerified || false,
      }
    })
  }

  async createSession(data: ICreateSessionDTO): Promise<Session> {
    return prisma.session.create({
      data:{
        userId : data.userId,
        refreshTokenHash : data.refreshTokenHash,
        expiresAt: data.expiresAt,
        userAgent : data.userAgent,
        ipAddress : data.ipAddress
      }
    })
  }

  async findSessionWithUser(sessionId: string): Promise<(Session & {user : User}) | null> {
    return prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    })
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }
}