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
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { CreateRoleUseCase } from '../../application/use-cases/create-role.use-case';
import { GetRolesUseCase } from '../../application/use-cases/get-roles.use-case';
import { GetRoleUseCase } from '../../application/use-cases/get-role.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/update-role.use-case';
import { DeleteRoleUseCase } from '../../application/use-cases/delete-role.use-case';

@Controller({
  path: 'roles',
  version: '1',
})
export class RolesController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRolesUseCase: GetRolesUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.getRolesUseCase.execute(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getRoleUseCase.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteRoleUseCase.execute(id);
  }
}
