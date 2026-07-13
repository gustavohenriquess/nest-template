/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { CreateRoleUseCase } from '../../application/use-cases/create-role.use-case';
import { GetRolesUseCase } from '../../application/use-cases/get-roles.use-case';
import { GetRoleUseCase } from '../../application/use-cases/get-role.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/update-role.use-case';
import { DeleteRoleUseCase } from '../../application/use-cases/delete-role.use-case';

describe('RolesController', () => {
  let controller: RolesController;
  let createUseCase: any;
  let getListUseCase: any;
  let getOneUseCase: any;
  let updateUseCase: any;
  let deleteUseCase: any;

  beforeEach(async () => {
    createUseCase = { execute: jest.fn() };
    getListUseCase = { execute: jest.fn() };
    getOneUseCase = { execute: jest.fn() };
    updateUseCase = { execute: jest.fn() };
    deleteUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: CreateRoleUseCase, useValue: createUseCase },
        { provide: GetRolesUseCase, useValue: getListUseCase },
        { provide: GetRoleUseCase, useValue: getOneUseCase },
        { provide: UpdateRoleUseCase, useValue: updateUseCase },
        { provide: DeleteRoleUseCase, useValue: deleteUseCase },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a role', async () => {
    createUseCase.execute.mockResolvedValue({ id: '1', name: 'ADMIN' });
    const result = await controller.create({ name: 'ADMIN' });
    expect(result.id).toBe('1');
    expect(createUseCase.execute).toHaveBeenCalledWith({ name: 'ADMIN' });
  });

  it('should get roles', async () => {
    getListUseCase.execute.mockResolvedValue({
      data: [],
      meta: { pagination: { total: 0 } },
    });
    const result = await controller.findAll(1, 10);
    expect(result.data).toBeDefined();
    expect(getListUseCase.execute).toHaveBeenCalledWith(1, 10);
  });

  it('should get one role', async () => {
    getOneUseCase.execute.mockResolvedValue({ id: '1', name: 'ADMIN' });
    const result = await controller.findOne('1');
    expect(result.id).toBe('1');
    expect(getOneUseCase.execute).toHaveBeenCalledWith('1');
  });

  it('should update a role', async () => {
    updateUseCase.execute.mockResolvedValue({ id: '1', name: 'ADMIN_UPDATED' });
    const result = await controller.update('1', { name: 'ADMIN_UPDATED' });
    expect(result.name).toBe('ADMIN_UPDATED');
    expect(updateUseCase.execute).toHaveBeenCalledWith('1', {
      name: 'ADMIN_UPDATED',
    });
  });

  it('should delete a role', async () => {
    deleteUseCase.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(deleteUseCase.execute).toHaveBeenCalledWith('1');
  });
});
