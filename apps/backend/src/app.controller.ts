import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService, type HealthStatus } from './app.service.js';
import { Public } from './auth/decorators/public.decorator.js';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Check API process health' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        service: 'psx-portfolio-api',
        timestamp: '2026-07-23T00:00:00.000Z',
      },
    },
  })
  getHealth(): HealthStatus {
    return this.appService.getHealth();
  }
}
