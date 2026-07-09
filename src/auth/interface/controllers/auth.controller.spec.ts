/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call loginUseCase with correct params and set cookie', async () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const expectedResult = { accessToken: 'jwt-token' };

    loginUseCase.execute.mockResolvedValue(expectedResult);

    const mockResponse = {
      cookie: jest.fn(),
    } as unknown as Response; // Cast to Response to satisfy TypeScript

    const result = await controller.login(loginDto, mockResponse);

    expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
    expect(loginUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'accessToken',
      'jwt-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      }),
    );
    expect(result).toEqual(expectedResult);
  });
});
