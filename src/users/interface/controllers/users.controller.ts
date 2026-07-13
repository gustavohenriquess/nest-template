import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';
import { PaginationQueryDto } from '@/core/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@/core/dto/paginated-response.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/get-users.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { Roles } from '@/core/auth/decorators/roles.decorator';
import { Cache } from '@/core/cache/decorators/cache.decorator';
import { InvalidateCache } from '@/core/cache/decorators/invalidate-cache.decorator';

@ApiTags('Users')
@Roles('ADMIN')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @InvalidateCache()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  @Cache()
  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.getUsersUseCase.execute(query);
  }

  @Get(':id')
  @Cache()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id') id: string) {
    return this.getUserUseCase.execute(id);
  }

  @Patch(':id')
  @InvalidateCache()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Delete(':id')
  @InvalidateCache()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.deleteUserUseCase.execute(id);
  }
}
