import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly frontendOrigin: string;

  constructor(configService: ConfigService) {
    this.frontendOrigin = configService.getOrThrow<string>('FRONTEND_URL');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) return true;

    if (request.get('x-requested-with') !== 'XMLHttpRequest') {
      throw new ForbiddenException('Missing CSRF request header');
    }

    const origin = request.get('origin');
    if (!origin) return true;

    const apiOrigin = `${request.protocol}://${request.get('host')}`;
    if (origin !== this.frontendOrigin && origin !== apiOrigin) {
      throw new ForbiddenException('Request origin is not allowed');
    }

    return true;
  }
}
