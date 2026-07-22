import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { argon2id, hash, verify } from 'argon2';
import { PrismaService } from '../database/prisma.service.js';
import type { AuthenticatedUser, SessionMetadata } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { SessionService, type IssuedSession } from './session.service.js';

export interface AuthenticationResult {
  user: AuthenticatedUser;
  session: IssuedSession;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
  ) {}

  async register(
    dto: RegisterDto,
    metadata: SessionMetadata,
  ): Promise<AuthenticationResult> {
    const passwordHash = await hash(dto.password, {
      type: argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    });

    let user: AuthenticatedUser;
    try {
      user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
        },
        select: this.publicUserSelection,
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }

    return {
      user,
      session: await this.sessions.issue(user.id, metadata),
    };
  }

  async login(
    dto: LoginDto,
    metadata: SessionMetadata,
  ): Promise<AuthenticationResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const passwordMatches = user
      ? await verify(user.passwordHash, dto.password).catch(() => false)
      : false;

    if (!user || !passwordMatches || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const publicUser: AuthenticatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
    };

    return {
      user: publicUser,
      session: await this.sessions.issue(user.id, metadata),
    };
  }

  private readonly publicUserSelection = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    emailVerifiedAt: true,
  } as const;

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
