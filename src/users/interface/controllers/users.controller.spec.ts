/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let createUseCase: any;
  let getUsersUseCase: any;
  let getUserUseCase: any;
  let updateUserUseCase: any;
  let deleteUserUseCase: any;

  beforeEach(() => {
    createUseCase = { execute: jest.fn() };
    getUsersUseCase = { execute: jest.fn() };
    getUserUseCase = { execute: jest.fn() };
    updateUserUseCase = { execute: jest.fn() };
    deleteUserUseCase = { execute: jest.fn() };

    controller = new UsersController(
      createUseCase,
      getUsersUseCase,
      getUserUseCase,
      updateUserUseCase,
      deleteUserUseCase,
    );
  });

  it('should call create use case', async () => {
    const dto = { name: 'Test', email: 'test@test.com', password: 'pass' };
    createUseCase.execute.mockResolvedValue({ id: '1' });

    await controller.create(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should call get users use case', async () => {
    const dto = { page: 1, limit: 10 };
    getUsersUseCase.execute.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(dto);
    expect(getUsersUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should call get user use case', async () => {
    getUserUseCase.execute.mockResolvedValue({ id: '1' });

    await controller.findOne('1');
    expect(getUserUseCase.execute).toHaveBeenCalledWith('1');
  });

  it('should call update use case', async () => {
    const dto = { name: 'New' };
    updateUserUseCase.execute.mockResolvedValue({ id: '1' });

    await controller.update('1', dto);
    expect(updateUserUseCase.execute).toHaveBeenCalledWith('1', dto);
  });

  it('should call delete use case', async () => {
    deleteUserUseCase.execute.mockResolvedValue(undefined);

    await controller.remove('1');
    expect(deleteUserUseCase.execute).toHaveBeenCalledWith('1');
  });
});
