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
  const portfolioEmail = `portfolio-e2e-${Date.now()}@example.com`;
  const otherEmail = `portfolio-other-e2e-${Date.now()}@example.com`;
  const authHeaders = {
    Origin: 'http://localhost:3000',
    'X-Requested-With': 'XMLHttpRequest',
  };

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

    await agent
      .post('/api/v1/auth/login')
      .set(authHeaders)
      .send({
        email: testEmail,
        password: 'A-secure-passphrase-123',
      })
      .expect(200);

    await agent.get('/api/v1/auth/me').expect(200);
    await agent.post('/api/v1/auth/logout').set(authHeaders).expect(204);
  });

  it('manages portfolios while enforcing ownership and archive rules', async () => {
    const owner = request.agent(app.getHttpServer() as Server);
    const otherUser = request.agent(app.getHttpServer() as Server);

    await owner
      .post('/api/v1/auth/register')
      .set(authHeaders)
      .send({
        name: 'Portfolio Owner',
        email: portfolioEmail,
        password: 'A-secure-passphrase-123',
      })
      .expect(201);
    await otherUser
      .post('/api/v1/auth/register')
      .set(authHeaders)
      .send({
        name: 'Other Investor',
        email: otherEmail,
        password: 'A-secure-passphrase-123',
      })
      .expect(201);

    const createResponse = await owner
      .post('/api/v1/portfolios')
      .set(authHeaders)
      .send({ name: 'Core Holdings' })
      .expect(201);
    const portfolioId = (createResponse.body as { portfolio: { id: string } })
      .portfolio.id;

    await owner
      .post('/api/v1/portfolios')
      .set(authHeaders)
      .send({ name: 'core holdings' })
      .expect(409);

    await owner
      .get('/api/v1/portfolios')
      .expect(200)
      .expect(({ body }) => {
        const responseBody = body as { portfolios: Array<{ id: string }> };
        expect(responseBody.portfolios).toHaveLength(1);
        expect(responseBody.portfolios[0]?.id).toBe(portfolioId);
      });

    await otherUser.get(`/api/v1/portfolios/${portfolioId}`).expect(404);

    await owner
      .patch(`/api/v1/portfolios/${portfolioId}`)
      .set(authHeaders)
      .send({ name: 'Growth Portfolio', allowNegativeCash: true })
      .expect(200)
      .expect(({ body }) => {
        const responseBody = body as {
          portfolio: { name: string; allowNegativeCash: boolean };
        };
        expect(responseBody.portfolio).toMatchObject({
          name: 'Growth Portfolio',
          allowNegativeCash: true,
        });
      });

    await owner
      .post(`/api/v1/portfolios/${portfolioId}/archive`)
      .set(authHeaders)
      .expect(200);
    await owner
      .get('/api/v1/portfolios')
      .expect(200)
      .expect(({ body }) => {
        expect((body as { portfolios: unknown[] }).portfolios).toHaveLength(0);
      });
    await owner
      .get('/api/v1/portfolios?includeArchived=true')
      .expect(200)
      .expect(({ body }) => {
        const responseBody = body as {
          portfolios: Array<{ id: string; archivedAt: string | null }>;
        };
        expect(responseBody.portfolios).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: portfolioId }),
          ]),
        );
        expect(responseBody.portfolios[0]?.archivedAt).not.toBeNull();
      });

    await owner
      .post('/api/v1/portfolios')
      .set(authHeaders)
      .send({ name: 'Growth Portfolio' })
      .expect(201);
    await owner
      .post(`/api/v1/portfolios/${portfolioId}/restore`)
      .set(authHeaders)
      .expect(409);
    await owner
      .patch(`/api/v1/portfolios/${portfolioId}`)
      .set(authHeaders)
      .send({ name: 'Archived Strategy' })
      .expect(200);
    await owner
      .post(`/api/v1/portfolios/${portfolioId}/restore`)
      .set(authHeaders)
      .expect(200);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, portfolioEmail, otherEmail] } },
    });
    await app.close();
  });
});
