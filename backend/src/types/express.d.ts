import { User } from '../../generated/prisma/index.d.ts';

declare global {
  namespace Express {
    interface Request {
      // we append an optional user property contain token description
      user? : {
        id: string;
        email : string;
      }
    }
  }
}