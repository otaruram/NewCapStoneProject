import { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends PrismaUser {}

    interface Request {
      user?: User;
      isAuthenticated?: () => boolean;
      logout?: (callback: (err?: Error) => void) => void;
      session?: any;
    }
  }
}
export {};
