import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import type { Response } from 'express';
import { PrismaService } from '../database/prisma.service.js';
import { getSessionCookieName } from './auth.constants.js';
import type { SessionMetadata } from './auth.types.js';

export interface IssuedSession {
  id: string;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class SessionService {
  private readonly nodeEnv: string;
  private readonly ttlDays: number;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    this.nodeEnv = configService.get<string>('NODE_ENV', 'development');
    this.ttlDays = configService.get<number>('SESSION_TTL_DAYS', 7);
  }

  async issue(
    userId: string,
    metadata: SessionMetadata,
  ): Promise<IssuedSession> {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(
      Date.now() + this.ttlDays * 24 * 60 * 60 * 1_000,
    );

    const session = await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        ipAddress: metadata.ipAddress?.slice(0, 64),
        userAgent: metadata.userAgent?.slice(0, 512),
      },
      select: { id: true },
    });

    return { id: session.id, token, expiresAt };
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  setCookie(response: Response, session: IssuedSession): void {
    response.cookie(getSessionCookieName(this.nodeEnv), session.token, {
      httpOnly: true,
      secure: this.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });
  }

  clearCookie(response: Response): void {
    response.clearCookie(getSessionCookieName(this.nodeEnv), {
      httpOnly: true,
      secure: this.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
