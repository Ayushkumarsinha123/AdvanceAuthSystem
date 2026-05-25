import bcrypt from 'bcrypt';
import { User } from '#db'
import { IAuthRepository } from './auth.interface.js';

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
}