import { RoleResponseDto } from './role.dto';
import { Role } from '../../domain/role.entity';
import { Test } from '@nestjs/testing';
import { Controller, Get } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { ApiResponse } from '@nestjs/swagger';

describe('RoleResponseDto', () => {
  it('should construct with permissions', () => {
    const role = new Role({
      name: 'ADMIN',
      permissions: [{ id: '1', name: 'test' }],
    });
    const dto = new RoleResponseDto(role);
    expect(dto.permissions).toBeDefined();
  });

  it('should construct without permissions', () => {
    const role = new Role({ name: 'ADMIN' });
    const dto = new RoleResponseDto(role);
    expect(dto.permissions).toBeUndefined();
  });

  it('should evaluate Swagger metadata to cover the arrow function', async () => {
    @Controller('dummy')
    class DummyController {
      @Get()
      @ApiResponse({ type: RoleResponseDto })
      getRole(): RoleResponseDto {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return new RoleResponseDto({} as any);
      }
    }

    const moduleRef = await Test.createTestingModule({
      controllers: [DummyController],
    }).compile();

    const app = moduleRef.createNestApplication();
    const options = new DocumentBuilder().build();
    const document = SwaggerModule.createDocument(app, options, {
      extraModels: [RoleResponseDto],
    });

    expect(document.components?.schemas?.RoleResponseDto).toBeDefined();
    await app.close();
  });
});
