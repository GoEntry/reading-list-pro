import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from '../bookmarks/bookmark.entity';
import { StatsResponseDto, DomainStatDto, DayStatDto } from './dto/stats-response.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly repo: Repository<Bookmark>,
  ) {}

  async getStats(userId: string, days: number): Promise<StatsResponseDto> {
    const [counts, allBookmarks, byDay] = await Promise.all([
      this.getCounts(userId),
      this.repo.find({ where: { userId }, select: { url: true } }),
      this.getByDay(userId, days),
    ]);

    return {
      ...counts,
      topDomains: this.extractTopDomains(allBookmarks),
      byDay,
    };
  }

  private async getCounts(userId: string): Promise<Pick<StatsResponseDto, 'total' | 'readCount' | 'unreadCount'>> {
    const rows = await this.repo.query(
      `SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE "isRead" = true) AS "readCount",
        COUNT(*) FILTER (WHERE "isRead" = false) AS "unreadCount"
       FROM bookmarks WHERE "userId" = $1`,
      [userId],
    );
    const row = rows[0] ?? { total: '0', readCount: '0', unreadCount: '0' };
    return {
      total: parseInt(row.total, 10),
      readCount: parseInt(row.readCount, 10),
      unreadCount: parseInt(row.unreadCount, 10),
    };
  }

  private extractTopDomains(bookmarks: Pick<Bookmark, 'url'>[]): DomainStatDto[] {
    // TODO: при > 10k закладок заменить на SQL SUBSTRING или материализованное поле
    const counts: Record<string, number> = {};
    for (const b of bookmarks) {
      try {
        const domain = new URL(b.url).hostname;
        counts[domain] = (counts[domain] ?? 0) + 1;
      } catch {
        // skip malformed URLs silently
      }
    }
    return Object.entries(counts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getByDay(userId: string, days: number): Promise<DayStatDto[]> {
    // date_trunc runs in DB timezone (UTC by default). Day boundaries may shift for
    // users in non-UTC timezones. Acceptable for MVP; fix in v2 with AT TIME ZONE.
    const rows = await this.repo.query(
      `SELECT date_trunc('day', "createdAt") AS date, COUNT(*) AS count
       FROM bookmarks
       WHERE "userId" = $1
         AND "createdAt" >= NOW() - ($2 * INTERVAL '1 day')
       GROUP BY 1
       ORDER BY 1 ASC`,
      [userId, days],
    );
    return rows.map((r: { date: Date; count: string }) => ({
      date: r.date.toISOString().split('T')[0],
      count: parseInt(r.count, 10),
    }));
  }
}
