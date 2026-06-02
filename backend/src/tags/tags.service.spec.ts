import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from './tag.entity';

const mockTag: Tag = {
  id: 'tag-1',
  userId: 'user-1',
  name: 'Tech',
  color: '#6366f1',
  createdAt: new Date(),
  user: undefined as any,
};

describe('TagsService', () => {
  let service: TagsService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<TagsService>(TagsService);
    repo = module.get(getRepositoryToken(Tag));
  });

  it('findAll returns tags for the user', async () => {
    repo.find.mockResolvedValue([mockTag]);
    const result = await service.findAll('user-1');
    expect(result).toEqual([mockTag]);
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });

  it('create saves a new tag', async () => {
    repo.create.mockReturnValue(mockTag);
    repo.save.mockResolvedValue(mockTag);
    const result = await service.create('user-1', { name: 'Tech' });
    expect(result).toEqual(mockTag);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', name: 'Tech' }),
    );
  });

  it('update throws NotFoundException for unknown tag', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.update('user-1', 'bad-id', { name: 'X' }))
      .rejects.toThrow(NotFoundException);
  });

  it('update throws ForbiddenException for another user tag', async () => {
    repo.findOne.mockResolvedValue({ ...mockTag, userId: 'other-user' });
    await expect(service.update('user-1', 'tag-1', { name: 'X' }))
      .rejects.toThrow(ForbiddenException);
  });

  it('update saves changes for owner', async () => {
    repo.findOne.mockResolvedValue({ ...mockTag });
    repo.save.mockImplementation((t: any) => Promise.resolve(t));
    const result = await service.update('user-1', 'tag-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('remove throws NotFoundException for unknown tag', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.remove('user-1', 'bad-id')).rejects.toThrow(NotFoundException);
  });
});
