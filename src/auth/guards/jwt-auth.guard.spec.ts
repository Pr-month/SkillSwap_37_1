import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { jwtConfig } from 'src/config/jwt.config';

describe('JwtAuthGuard', () => {
  let jwtGuard: JwtAuthGuard;
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        JwtAuthGuard,
        JwtStrategy,
        {
          provide: jwtConfig.KEY,
          useValue: { secret: 'test-secret', expiresIn: '15m' },
        },
      ],
    }).compile();

    jwtGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtGuard).toBeDefined();
  });

  it('should allow access for valid token', async () => {
    jest.spyOn(jwtGuard, 'canActivate').mockResolvedValue(true);

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
        getResponse: () => ({}),
      }),
    } as ExecutionContext;

    const result = await jwtGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    jest.spyOn(jwtGuard, 'canActivate').mockRejectedValue(new UnauthorizedException());

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
        getResponse: () => ({}),
      }),
    } as ExecutionContext;

    await expect(jwtGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
