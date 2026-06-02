import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly repo: Repository<Tag>,
  ) {}

  findAll(userId: string): Promise<Tag[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }

  create(userId: string, dto: CreateTagDto): Promise<Tag> {
    const tag = this.repo.create({ userId, ...dto });
    return this.repo.save(tag);
  }

  async update(userId: string, id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOwned(userId, id);
    Object.assign(tag, dto);
    return this.repo.save(tag);
  }

  async remove(userId: string, id: string): Promise<void> {
    const tag = await this.findOwned(userId, id);
    await this.repo.remove(tag);
  }

  private async findOwned(userId: string, id: string): Promise<Tag> {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    if (tag.userId !== userId) throw new ForbiddenException();
    return tag;
  }
}
