# Autenticação e Autorização (IAM)

## Visão Geral

Este guia explica a implementação de **Identity & Access Management (IAM)** baseada em **JWT** utilizada no template NestJS. A camada de segurança segue o princípio **"Secure by Default"** (Seguro por Padrão) – todas as rotas são protegidas, a menos que sejam explicitamente marcadas como públicas.

## Componentes Principais

| Componente | Finalidade |
|------------|------------|
| `JwtStrategy` | Configura a estratégia `passport-jwt`, extrai o token do cabeçalho e valida a assinatura. Extrai dinamicamente **Roles** e **Permissões** usando caminhos definidos em variáveis de ambiente. |
| `JwtAuthGuard` | Guarda global (`APP_GUARD`) que delega a autenticação para a `JwtStrategy`. Rejeita requisições sem um token válido (401). |
| `PolicyGuard` | Guarda global (`APP_GUARD`) que implementa **Autorização Híbrida (lógica OR)**. Garante acesso se o usuário tiver a Role **OU** as Permissões exigidas. |
| `RolesGuard` | Guarda local para uso manual. Verifica as **roles** exigidas. Útil para forçar lógica **AND** estrita. |
| `PermissionsGuard`| Guarda local para uso manual. Verifica **permissões/scopes** granulares. Útil para forçar lógica **AND** estrita. |
| Decorators | `@Public()` – marca uma rota como pública. `@Roles(...roles)` – declara roles exigidas. `@Permissions(...perms)` – declara permissões exigidas. `@CurrentUser()` – injeta a sessão do usuário. |
| `AuthModule` | Registra a estratégia e as guardas, expondo-as globalmente. |

## Configuração

1. **Variáveis de Ambiente** – adicione as chaves ao seu arquivo `.env`:
   ```bash
   JWT_SECRET=my-super-secret-jwt-key-for-local-dev-123
   # Opcional: ajuste os caminhos baseados no seu Provedor de Identidade (ex: Microsoft, Google)
   AUTH_ROLES_CLAIM_PATH=roles
   AUTH_PERMISSIONS_CLAIM_PATH=permissions
   ```
2. **Módulo de Autenticação** (`src/core/auth/auth.module.ts`):
   ```typescript
   @Module({
     providers: [JwtStrategy, JwtAuthGuard, RolesGuard],
   })
   export class AuthModule {}
   ```
   As guardas são anexadas globalmente via `APP_GUARD`, portanto você não precisa adicioná-las manualmente em cada controller.
3. **Protegendo Rotas** – por padrão, todas as rotas exigem autenticação.
   ```typescript
   @Get('health/integrations')
   getHealth() { … }                // Exige um JWT válido

   @Public()
   @Get('health')
   getHealth() { … }                // Endpoint público

   @Roles('ADMIN')
   @Get('admin')
   getAdminData() { … }             // Exige JWT + role ADMIN

   @Permissions('reports:view')
   @Get('reports')
   getReports() { … }               // Exige JWT + permissão 'reports:view'

   @Roles('MANAGER')
   @Permissions('billing:write')
   @Patch('billing')
   updateBilling() { … }            // Exige JWT + (role MANAGER OU permissão 'billing:write') - Padrão do PolicyGuard

   // Para lógica AND estrita (Role E Permissão), use as guardas locais:
   @Roles('MANAGER')
   @Permissions('billing:write')
   @UseGuards(RolesGuard, PermissionsGuard)
   @Patch('critical-billing')
   criticalUpdate() { … }           // Exige JWT + role MANAGER E permissão 'billing:write'
   ```

### 4. Acessando o Usuário Atual
Use o decorator `@CurrentUser()` para injetar a sessão do usuário autenticado diretamente nos métodos do seu controller.

```typescript
@Get('me')
getProfile(@CurrentUser() user: UserSession) {
  return {
    id: user.sub,
    email: user.email,
    roles: user.roles,
  };
}
```

## Gerando um JWT para Desenvolvimento

Um pequeno script utilitário foi disponibilizado em `scripts/generate-token.ts`. Ele também pode ser executado via Makefile:
```bash
make auth-token
```
O script imprime um token pronto para uso e o payload utilizado. Edite a constante `payload` no script para simular diferentes usuários, roles e permissões:
```typescript
const payload = {
  sub: 'user-123',
  email: 'test@example.com',
  roles: ['ADMIN'],
  permissions: ['health:read', 'integrations:write'],
};
```

## Utilizando o Token em Requisições

### cURL
```bash
TOKEN=$(npx ts-node scripts/generate-token.ts | grep -E '^ey' | head -n1)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/v1/health/integrations
```

### Postman / Insomnia
1. Crie uma requisição.
2. Na aba **Authorization**, selecione **Bearer Token**.
3. Cole o token gerado pelo script (não inclua a palavra *Bearer* – o cliente a adicionará automaticamente).

### Swagger UI
O módulo Swagger já está configurado com `@ApiBearerAuth()` para endpoints protegidos. Clique no ícone de cadeado (**Authorize**), cole o token (apenas o valor) e clique em **Authorize**.

## Testando a Camada de Autenticação

### Testes Unitários
- `src/core/auth/strategies/jwt.strategy.spec.ts` – valida o tratamento do payload e o uso da secret.
- `src/core/auth/guards/jwt-auth.guard.spec.ts` – garante que a guarda retorna 401 quando o token está ausente ou inválido.
- `src/core/auth/guards/roles.guard.spec.ts` – cobre as verificações de role, incluindo cenários com arrays de roles vazios.

### Teste End-to-End (E2E)
Localizado em `test/health.e2e-spec.ts`:
```typescript
let jwtService: JwtService;

beforeAll(async () => {
  await helper.bootstrap();
  jwtService = helper.getApp().get<JwtService>(JwtService);
});

it('/v1/health/integrations (GET)', () => {
  const token = jwtService.sign({ sub: 'e2e-user', roles: [] });
  return request(helper.getApp().getHttpServer() as never)
    .get('/v1/health/integrations')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
```
O teste utiliza o `JwtService` real do container Nest para gerar um token válido, garantindo a mesma secret e configuração utilizadas pela aplicação.

## Próximos Passos

- **Auth Micro-service** – extrair a emissão de tokens para um micro-serviço de autenticação dedicado e utilizar a mesma estratégia de guarda em todos os serviços.
- **Refresh Tokens** – implementar fluxo de refresh-token e uma blacklist de tokens para revogação.
- **Seed de Usuários** – adicionar um script de seed do Prisma para criar usuários padrão com diversas roles para testes manuais.

---

> **Dica**: mantenha o arquivo `scripts/generate-token.ts` fora do build de produção (ele já está excluído via `tsconfig.build.json`). Isso torna o script disponível para desenvolvedores sem afetar o pacote compilado.
