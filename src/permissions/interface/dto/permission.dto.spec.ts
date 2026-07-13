import { PermissionResponseDto } from './permission.dto';
import { Permission } from '../../domain/permission.entity';

describe('PermissionResponseDto', () => {
  it('should construct correctly', () => {
    const permission = new Permission({
      name: 'users:read',
      description: 'Read users',
    });
    const dto = new PermissionResponseDto(permission);
    expect(dto.name).toBe('users:read');
    expect(dto.description).toBe('Read users');
  });
});
