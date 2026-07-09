import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CacheService } from '@/core/cache/cache.service';
import { LoginDto } from '../../interface/dto/login.dto';
import { UserStatus } from '@/users/domain/user.entity';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@/users/domain/user.repository';
import { UnauthorizedError, ForbiddenError } from '@/core/errors/domain.error';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(dto: LoginDto): Promise<{ accessToken: string }> {
    // 1. Encontrar o usuário e suas roles/permissions usando o repositório
    const user = await this.userRepository.findByEmailWithRolesAndPermissions(
      dto.email,
    );

    if (!user) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    // 2. Verificar o hash da senha
    const isPasswordValid = await argon2.verify(user.password!, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    // 3. Verificar status do usuário
    if (user.status !== UserStatus.ATIVO) {
      throw new ForbiddenError('Usuário inativo ou pendente');
    }

    // 4. Mapear roles e permissions
    const rolesPath =
      this.configService.get<string>('AUTH_ROLES_CLAIM_PATH') || 'roles';
    const permissionsPath =
      this.configService.get<string>('AUTH_PERMISSIONS_CLAIM_PATH') ||
      'permissions';

    const roleNames = user.roles ? user.roles.map((r) => r.name) : [];

    const rolePermissions = user.roles
      ? user.roles.flatMap((r) => r.permissions?.map((p) => p.name) || [])
      : [];

    const directPermissions = user.permissions
      ? user.permissions.map((p) => p.name)
      : [];

    const allPermissions = Array.from(
      new Set([...rolePermissions, ...directPermissions]),
    );

    // 5. Gerar o Payload
    const payload = {
      sub: user.id,
      email: user.email,
      [rolesPath]: roleNames,
      [permissionsPath]: allPermissions,
    };

    const accessToken = this.jwtService.sign(payload);

    // 6. Opcional: Fazer cache do usuário/sessão no Redis (ttl 1 dia)
    // await this.cacheService.set(`user:${user.id}:session`, payload, 86400);

    return { accessToken };
  }
}
