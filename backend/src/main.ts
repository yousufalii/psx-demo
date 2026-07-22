import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureApplication } from './configure-app.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  configureApplication(app, configService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PSX Portfolio API')
    .setDescription('API contract for the PSX Portfolio Management App')
    .setVersion('1.0')
    .addCookieAuth('session')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    jsonDocumentUrl: 'api/docs-json',
  });

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
}

void bootstrap();
