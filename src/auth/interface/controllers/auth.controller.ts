import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../dto/login.dto';
import { Public } from '@/core/auth/decorators/public.decorator';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUseCase.execute(dto);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000, // 1 day in milliseconds
    });

    return result;
  }
}
