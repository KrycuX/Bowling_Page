import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get('healthz')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      timezone: this.configService.get('TIMEZONE'),
    };
  }
}
