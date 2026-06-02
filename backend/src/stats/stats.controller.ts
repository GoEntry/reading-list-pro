import { Controller, Get, Query, UseGuards, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { StatsService } from './stats.service';
import { StatsResponseDto } from './dto/stats-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get reading statistics' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    example: 30,
    description: 'Number of days for the byDay breakdown (1–365, default 30)',
  })
  @ApiResponse({ status: 200, type: StatsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStats(
    @Req() req: Request & { user: { id: string } },
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const safeDays = Math.min(Math.max(days, 1), 365);
    return this.statsService.getStats(req.user.id, safeDays);
  }
}
