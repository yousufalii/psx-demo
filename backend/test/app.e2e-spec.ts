import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request, { type Agent } from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApplication } from './../src/configure-app.js';
import { PrismaService } from './../src/database/prisma.service.js';

describe('Application API (e2e)', () => {
  let app: INestApplication;
  let agent: Agent;
  let prisma: PrismaService;
  const testEmail = `auth-e2e-${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const expressApp =
      moduleFixture.createNestApplication<NestExpressApplication>();
    configureApplication(expressApp, expressApp.get(ConfigService));
    await expressApp.init();

    app = expressApp;
    prisma = app.get(PrismaService);
    agent = request.agent(app.getHttpServer() as Server);
  });

  it('reports process health publicly', async () => {
    await request(app.getHttpServer() as Server)
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ok',
          service: 'psx-portfolio-api',
        });
      });
  });

  it('registers, authenticates, and revokes an opaque session', async () => {
    const authHeaders = {
      Origin: 'http://localhost:3000',
      'X-Requested-With': 'XMLHttpRequest',
    };

    await agent
      .post('/api/v1/auth/register')
      .set(authHeaders)
      .send({
        name: 'Auth Test User',
        email: testEmail,
        password: 'A-secure-passphrase-123',
      })
      .expect(201)
      .expect(({ body, headers }) => {
        const responseBody = body as {
          user: { name: string; email: string; role: string };
        };
        expect(responseBody.user).toMatchObject({
          name: 'Auth Test User',
          email: testEmail,
          role: 'USER',
        });
        expect(headers['set-cookie']?.[0]).toContain('HttpOnly');
      });

    await agent
      .get('/api/v1/auth/me')
      .expect(200)
      .expect(({ body }) => {
        const responseBody = body as {
          user: { email: string; passwordHash?: string };
        };
        expect(responseBody.user.email).toBe(testEmail);
        expect(responseBody.user.passwordHash).toBeUndefined();
      });

    await agent.post('/api/v1/auth/logout').set(authHeaders).expect(204);

    await agent.get('/api/v1/auth/me').expect(401);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });
});
