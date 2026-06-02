import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './bookmark.entity';
import { Tag } from '../tags/tag.entity';

const mockBookmark: Bookmark = {
  id: 'bm-1',
  userId: 'user-1',
  url: 'https://example.com',
  title: 'Example',
  description: null,
  favicon: null,
  previewImage: null,
  notes: null,
  isRead: false,
  readAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
  user: undefined as any,
};

describe('BookmarksService', () => {
  let service: BookmarksService;
  let repo: any;
  let tagRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        {
          provide: getRepositoryToken(Bookmark),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: { findBy: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
    repo = module.get(getRepositoryToken(Bookmark));
    tagRepo = module.get(getRepositoryToken(Tag));
  });

  describe('findAll', () => {
    it('returns paginated bookmarks for user', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBookmark], 1]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll('user-1');

      expect(result).toEqual({ items: [mockBookmark], total: 1, page: 1, limit: 20 });
      expect(qb.where).toHaveBeenCalledWith('b.userId = :userId', { userId: 'user-1' });
    });
  });

  describe('create', () => {
    it('creates bookmark without tags', async () => {
      repo.create.mockReturnValue(mockBookmark);
      repo.save.mockResolvedValue(mockBookmark);

      const result = await service.create('user-1', { url: 'https://example.com', title: 'Example' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', url: 'https://example.com' }),
      );
      expect(result).toEqual(mockBookmark);
    });
  });

  describe('findOne', () => {
    it('returns bookmark for owner', async () => {
      repo.findOne.mockResolvedValue(mockBookmark);
      expect(await service.findOne('user-1', 'bm-1')).toEqual(mockBookmark);
    });

    it('throws NotFoundException for unknown id', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'bad')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for other user bookmark', async () => {
      repo.findOne.mockResolvedValue({ ...mockBookmark, userId: 'other' });
      await expect(service.findOne('user-1', 'bm-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('sets readAt when marking as read', async () => {
      repo.findOne.mockResolvedValue({ ...mockBookmark });
      repo.save.mockImplementation((b: any) => Promise.resolve(b));

      const result = await service.update('user-1', 'bm-1', { isRead: true });

      expect(result.isRead).toBe(true);
      expect(result.readAt).not.toBeNull();
    });

    it('clears readAt when marking as unread', async () => {
      const read = { ...mockBookmark, isRead: true, readAt: new Date() };
      repo.findOne.mockResolvedValue(read);
      repo.save.mockImplementation((b: any) => Promise.resolve(b));

      const result = await service.update('user-1', 'bm-1', { isRead: false });

      expect(result.isRead).toBe(false);
      expect(result.readAt).toBeNull();
    });
  });
});
