import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'ok';
  service: 'psx-portfolio-api';
  timestamp: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return {
      status: 'ok',
      service: 'psx-portfolio-api',
      timestamp: new Date().toISOString(),
    };
  }
}
