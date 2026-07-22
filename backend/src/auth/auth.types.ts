import type { Request } from 'express';
import type { UserRole, UserStatus } from '../generated/prisma/enums.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: Date | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  authSessionId?: string;
}

export interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
}
