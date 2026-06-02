import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatsService } from './stats.service';
import { Bookmark } from '../bookmarks/bookmark.entity';

describe('StatsService', () => {
  let service: StatsService;
  let repo: jest.Mocked<Pick<Repository<Bookmark>, 'query' | 'find'>>;

  beforeEach(async () => {
    repo = { query: jest.fn(), find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: getRepositoryToken(Bookmark), useValue: repo },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('returns aggregated counts', async () => {
    repo.query
      .mockResolvedValueOnce([{ total: '5', readCount: '2', unreadCount: '3' }])
      .mockResolvedValueOnce([]);
    repo.find.mockResolvedValue([]);

    const result = await service.getStats('user-1', 30);

    expect(result.total).toBe(5);
    expect(result.readCount).toBe(2);
    expect(result.unreadCount).toBe(3);
  });

  it('returns top domains sorted by count descending', async () => {
    repo.query
      .mockResolvedValueOnce([{ total: '3', readCount: '0', unreadCount: '3' }])
      .mockResolvedValueOnce([]);
    repo.find.mockResolvedValue([
      { url: 'https://github.com/a' },
      { url: 'https://github.com/b' },
      { url: 'https://example.com/c' },
    ] as Bookmark[]);

    const result = await service.getStats('user-1', 30);

    expect(result.topDomains[0]).toEqual({ domain: 'github.com', count: 2 });
    expect(result.topDomains[1]).toEqual({ domain: 'example.com', count: 1 });
  });

  it('silently skips malformed URLs', async () => {
    repo.query
      .mockResolvedValueOnce([{ total: '1', readCount: '0', unreadCount: '1' }])
      .mockResolvedValueOnce([]);
    repo.find.mockResolvedValue([{ url: 'not-a-url' }] as Bookmark[]);

    const result = await service.getStats('user-1', 30);
    expect(result.topDomains).toEqual([]);
  });

  it('maps byDay SQL rows to ISO date strings', async () => {
    repo.query
      .mockResolvedValueOnce([{ total: '0', readCount: '0', unreadCount: '0' }])
      .mockResolvedValueOnce([{ date: new Date('2026-06-01T00:00:00Z'), count: '3' }]);
    repo.find.mockResolvedValue([]);

    const result = await service.getStats('user-1', 7);
    expect(result.byDay).toEqual([{ date: '2026-06-01', count: 3 }]);
  });

  it('caps topDomains at 5 entries', async () => {
    repo.query
      .mockResolvedValueOnce([{ total: '6', readCount: '0', unreadCount: '6' }])
      .mockResolvedValueOnce([]);
    repo.find.mockResolvedValue([
      { url: 'https://a.com' }, { url: 'https://b.com' }, { url: 'https://c.com' },
      { url: 'https://d.com' }, { url: 'https://e.com' }, { url: 'https://f.com' },
    ] as Bookmark[]);

    const result = await service.getStats('user-1', 30);
    expect(result.topDomains.length).toBe(5);
  });
});
