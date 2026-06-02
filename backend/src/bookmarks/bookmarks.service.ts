import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import { Tag } from '../tags/tag.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

export interface BookmarkFilter {
  search?: string;
  tagIds?: string[];
  isRead?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly repo: Repository<Bookmark>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll(userId: string, filter: BookmarkFilter = {}) {
    const { search, tagIds, isRead, page = 1, limit = 20 } = filter;

    const qb = this.repo.createQueryBuilder('b')
      .leftJoinAndSelect('b.tags', 'tag')
      .where('b.userId = :userId', { userId })
      .orderBy('b.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('(LOWER(b.title) LIKE :s OR LOWER(b.url) LIKE :s)', {
        s: `%${search.toLowerCase()}%`,
      });
    }
    if (isRead !== undefined) {
      qb.andWhere('b.isRead = :isRead', { isRead });
    }
    if (tagIds?.length) {
      qb.andWhere(
        'b.id IN (SELECT bt."bookmarkId" FROM bookmark_tags bt WHERE bt."tagId" IN (:...tagIds))',
        { tagIds },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  findOne(userId: string, id: string): Promise<Bookmark> {
    return this.findOwned(userId, id);
  }

  async create(userId: string, dto: CreateBookmarkDto): Promise<Bookmark> {
    const { tagIds, ...rest } = dto;
    const tags = tagIds?.length
      ? await this.tagRepo.findBy({ id: In(tagIds), userId })
      : [];
    const bookmark = this.repo.create({ userId, ...rest, tags });
    return this.repo.save(bookmark);
  }

  async update(userId: string, id: string, dto: UpdateBookmarkDto): Promise<Bookmark> {
    const bookmark = await this.findOwned(userId, id);
    const { tagIds, isRead, ...rest } = dto;

    if (tagIds !== undefined) {
      bookmark.tags = tagIds.length
        ? await this.tagRepo.findBy({ id: In(tagIds), userId })
        : [];
    }
    if (isRead !== undefined) {
      bookmark.isRead = isRead;
      bookmark.readAt = isRead ? new Date() : null;
    }

    Object.assign(bookmark, rest);
    return this.repo.save(bookmark);
  }

  async remove(userId: string, id: string): Promise<void> {
    const bookmark = await this.findOwned(userId, id);
    await this.repo.remove(bookmark);
  }

  private async findOwned(userId: string, id: string): Promise<Bookmark> {
    const bookmark = await this.repo.findOne({ where: { id }, relations: ['tags'] });
    if (!bookmark) throw new NotFoundException(`Bookmark ${id} not found`);
    if (bookmark.userId !== userId) throw new ForbiddenException();
    return bookmark;
  }
}
