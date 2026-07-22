import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../database/prisma.service.js';
import { IS_PUBLIC_KEY, getSessionCookieName } from '../auth.constants.js';
import type { AuthenticatedRequest } from '../auth.types.js';
import { SessionService } from '../session.service.js';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly cookieName: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
    configService: ConfigService,
  ) {
    this.cookieName = getSessionCookieName(
      configService.get<string>('NODE_ENV', 'development'),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<
        AuthenticatedRequest & { cookies?: Record<string, string> }
      >();
    const token = this.readCookie(request);
    if (!token) throw new UnauthorizedException();

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.sessionService.hashToken(token) },
      select: {
        id: true,
        expiresAt: true,
        revokedAt: true,
        lastSeenAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            emailVerifiedAt: true,
          },
        },
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException();
    }

    request.user = session.user;
    request.authSessionId = session.id;

    if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1_000) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() },
      });
    }

    return true;
  }

  private readCookie(request: Request): string | undefined {
    const cookies: unknown = request.cookies;
    if (!cookies || typeof cookies !== 'object') return undefined;

    const token = (cookies as Record<string, unknown>)[this.cookieName];
    return typeof token === 'string' ? token : undefined;
  }
}
