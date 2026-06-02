import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './user.entity';

const mockUser: User = {
  id: 'uuid-1',
  email: 'test@example.com',
  passwordHash: 'hashed',
  refreshToken: null,
  createdAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('hashes password and saves user', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockUser);
      repo.save.mockResolvedValue(mockUser);

      const result = await service.create('test@example.com', 'password123');

      const createArg = repo.create.mock.calls[0][0];
      expect(createArg.passwordHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', createArg.passwordHash)).toBe(true);
      expect(result).toEqual(mockUser);
    });

    it('throws ConflictException when email exists', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      await expect(service.create('test@example.com', 'pw'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      repo.findOne.mockResolvedValue(mockUser);
      expect(await service.findByEmail('test@example.com')).toEqual(mockUser);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await service.findByEmail('x@x.com')).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('stores null on logout', async () => {
      repo.update.mockResolvedValue({ affected: 1 });
      await service.updateRefreshToken('uuid-1', null);
      expect(repo.update).toHaveBeenCalledWith('uuid-1', { refreshToken: null });
    });

    it('stores hashed token on login', async () => {
      repo.update.mockResolvedValue({ affected: 1 });
      await service.updateRefreshToken('uuid-1', 'raw-token');
      const arg = repo.update.mock.calls[0][1];
      expect(arg.refreshToken).not.toBe('raw-token');
      expect(await bcrypt.compare('raw-token', arg.refreshToken)).toBe(true);
    });
  });
});
