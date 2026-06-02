import { ApiProperty } from '@nestjs/swagger';

export class DomainStatDto {
  @ApiProperty({ example: 'github.com' })
  domain: string;

  @ApiProperty({ example: 12 })
  count: number;
}

export class DayStatDto {
  @ApiProperty({ example: '2026-06-01' })
  date: string;

  @ApiProperty({ example: 5 })
  count: number;
}

export class StatsResponseDto {
  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 18 })
  readCount: number;

  @ApiProperty({ example: 24 })
  unreadCount: number;

  @ApiProperty({ type: [DomainStatDto] })
  topDomains: DomainStatDto[];

  @ApiProperty({ type: [DayStatDto] })
  byDay: DayStatDto[];
}
