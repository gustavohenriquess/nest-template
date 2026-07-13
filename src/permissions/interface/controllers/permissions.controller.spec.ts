/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { CreatePermissionUseCase } from '../../application/use-cases/create-permission.use-case';
import { GetPermissionsUseCase } from '../../application/use-cases/get-permissions.use-case';
import { GetPermissionUseCase } from '../../application/use-cases/get-permission.use-case';
import { UpdatePermissionUseCase } from '../../application/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from '../../application/use-cases/delete-permission.use-case';

describe('PermissionsController', () => {
  let controller: PermissionsController;
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
      controllers: [PermissionsController],
      providers: [
        { provide: CreatePermissionUseCase, useValue: createUseCase },
        { provide: GetPermissionsUseCase, useValue: getListUseCase },
        { provide: GetPermissionUseCase, useValue: getOneUseCase },
        { provide: UpdatePermissionUseCase, useValue: updateUseCase },
        { provide: DeletePermissionUseCase, useValue: deleteUseCase },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a permission', async () => {
    createUseCase.execute.mockResolvedValue({ id: '1', name: 'admin' });
    const result = await controller.create({ name: 'admin' });
    expect(result.id).toBe('1');
    expect(createUseCase.execute).toHaveBeenCalledWith({ name: 'admin' });
  });

  it('should get permissions', async () => {
    getListUseCase.execute.mockResolvedValue({
      data: [],
      meta: { pagination: { total: 0 } },
    });
    const result = await controller.findAll(1, 10);
    expect(result.data).toBeDefined();
    expect(getListUseCase.execute).toHaveBeenCalledWith(1, 10);
  });

  it('should get one permission', async () => {
    getOneUseCase.execute.mockResolvedValue({ id: '1', name: 'admin' });
    const result = await controller.findOne('1');
    expect(result.id).toBe('1');
    expect(getOneUseCase.execute).toHaveBeenCalledWith('1');
  });

  it('should update a permission', async () => {
    updateUseCase.execute.mockResolvedValue({ id: '1', name: 'admin_updated' });
    const result = await controller.update('1', { name: 'admin_updated' });
    expect(result.name).toBe('admin_updated');
    expect(updateUseCase.execute).toHaveBeenCalledWith('1', {
      name: 'admin_updated',
    });
  });

  it('should delete a permission', async () => {
    deleteUseCase.execute.mockResolvedValue(undefined);
    await controller.remove('1');
    expect(deleteUseCase.execute).toHaveBeenCalledWith('1');
  });
});
