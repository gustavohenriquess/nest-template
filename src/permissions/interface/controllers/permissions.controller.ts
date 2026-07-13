import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto/permission.dto';
import { CreatePermissionUseCase } from '../../application/use-cases/create-permission.use-case';
import { GetPermissionsUseCase } from '../../application/use-cases/get-permissions.use-case';
import { GetPermissionUseCase } from '../../application/use-cases/get-permission.use-case';
import { UpdatePermissionUseCase } from '../../application/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from '../../application/use-cases/delete-permission.use-case';

@Controller({
  path: 'permissions',
  version: '1',
})
export class PermissionsController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly getPermissionsUseCase: GetPermissionsUseCase,
    private readonly getPermissionUseCase: GetPermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
  ) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.createPermissionUseCase.execute(createPermissionDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.getPermissionsUseCase.execute(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getPermissionUseCase.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.updatePermissionUseCase.execute(id, updatePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deletePermissionUseCase.execute(id);
  }
}
