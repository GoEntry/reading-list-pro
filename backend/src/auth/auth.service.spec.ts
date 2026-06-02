import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

let mockUser: User;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    mockUser = {
      id: 'uuid-1',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      refreshToken: null,
      createdAt: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            updateRefreshToken: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('mock-token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const result = await service.login('test@example.com', 'password123');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.userId).toBe('uuid-1');
    });

    it('throws for unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.login('x@x.com', 'pw')).rejects.toThrow(UnauthorizedException);
    });

    it('throws for wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clears the refresh token', async () => {
      await service.logout('uuid-1');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('uuid-1', null);
    });
  });

  describe('refresh', () => {
    it('issues new tokens for valid user', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      const result = await service.refresh('uuid-1');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('throws when user not found', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(service.refresh('uuid-1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
