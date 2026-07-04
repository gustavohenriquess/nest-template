# 🔐 Roadmap: Sistema de Autenticação e Autorização (RBAC/PBAC)

Este documento descreve todas as etapas necessárias para construir o módulo de Login robusto baseado nos requisitos levantados, utilizando a stack atual (NestJS, Prisma, PostgreSQL, Redis, JWT).

---

## 1. Modelagem do Banco de Dados (Prisma)
- [x] **Criar Enums e Modelos base no `schema.prisma`**
  - **Enum UserStatus**: `ATIVO`, `INATIVO`, `PENDENTE`.
  - **Model User**: `id`, `name`, `email` (único), `password` (hash), `avatarUrl` (opcional), `status` (default: PENDENTE).
  - **Model Role**: `id`, `name` (único), `description`.
  - **Model Permission**: `id`, `name` (único, ex: `users:read`, `users:write`).
- [x] **Criar os Relacionamentos (N:M)**
  - Um `User` pode ter muitas `Role`s e muitas `Permission`s exclusivas.
  - Uma `Role` pode ter muitas `Permission`s.
- [ ] **Gerar e aplicar Migration**
  - Rodar `npx prisma migrate dev --name init_auth_schema`.

---

## 2. Instalação de Dependências Faltantes
- [ ] Instalar o pacote para hash de senhas: `npm i argon2` ou `npm i bcrypt` (e suas tipagens `@types/bcrypt`).

---

## 3. Módulo de Autenticação (AuthModule)
- [ ] **Configurar JWT Module**
  - Configurar `@nestjs/jwt` com secret vinda do `.env` e TTL estático (ou configurável) de `7d` (7 dias).
- [ ] **Criar `POST /api/v1/auth/login`**
  - Receber `email` e `password`.
  - Buscar usuário pelo email no PostgreSQL.
  - Verificar se a senha está correta (comparar hash).
  - **Validar Status**: Rejeitar com `403 Forbidden` ou `401 Unauthorized` se o `status` for `PENDENTE` ou `INATIVO`.
  - Gerar o token JWT (payload contendo `sub: userId`, `email`).
  - **Otimização (Redis)**: Salvar as Roles e Permissions do usuário no Redis (`user:${userId}:roles`) por 7 dias, evitando bater no PostgreSQL nas próximas requisições.
- [ ] **Criar `POST /api/v1/auth/logout`**
  - Como o JWT é *stateless*, não existe uma forma nativa de "apagar" o token gerado.
  - **Estratégia (Blacklist)**: Receber o token atual e salvá-mo em uma *blacklist* no Redis, usando o tempo restante de expiração do token (TTL).
  - Todo Guard que validar o JWT deverá checar no Redis se o token está na *blacklist*.

---

## 4. Módulo de Usuários (UsersModule)
- [ ] **Criar DTOs com Zod** (para validação)
  - `CreateUserDto` (nome, email, senha obrigatórios).
  - `UpdateUserDto` (campos opcionais).
- [ ] **Criar Controladores (CRUD)**
  - `POST /api/v1/users`: Criação do usuário. (Sempre encodar a senha antes de salvar).
  - `GET /api/v1/users`: Listagem (paginada).
  - `GET /api/v1/users/:id`: Detalhes.
  - `PATCH /api/v1/users/:id`: Atualização (incluindo upload de imagem/avatarUrl e alteração de Status).
  - `DELETE /api/v1/users/:id`: Exclusão (ou *Soft Delete*, mudando o status para INATIVO).

---

## 5. Módulo de Perfis e Permissões (Roles e Permissions)
- [ ] **RolesModule (CRUD)**
  - `POST`, `GET`, `PATCH`, `DELETE` em `/api/v1/roles`.
  - Relacionar as roles à tabela de permissões.
- [ ] **PermissionsModule (CRUD)**
  - `POST`, `GET`, `PATCH`, `DELETE` em `/api/v1/permissions`.

---

## 6. Integração com Guards (Proteção das Rotas)
> **Nota:** A base estrutural dos Guards e Decorators já existe no diretório `src/core/auth/` (`JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`, `@Roles()`, `@Permissions()`). O trabalho aqui será apenas a sua **integração** com a nova modelagem de dados e cache:

- [ ] **AuthGuard (`JwtAuthGuard`) - Atualização**
  - Implementar a checagem no Redis para verificar se o token está na *blacklist* (logout).
  - Buscar as Roles e Permissions cacheadas no Redis e injetar no `req.user` para alimentar os Guards de autorização seguintes.
- [ ] **Authorization Guards (`RolesGuard` / `PermissionsGuard`)**
  - Já estão prontos para ler os metadados! Bastará garantir que a tipagem do `req.user` feita no JWT traga corretamente os arrays de strings `roles[]` e `permissions[]`.

---

## Estrutura Prisma Sugerida (Exemplo):

```prisma
enum UserStatus {
  ATIVO
  INATIVO
  PENDENTE
}

model User {
  id          String       @id @default(uuid())
  name        String
  email       String       @unique
  password    String
  avatarUrl   String?
  status      UserStatus   @default(PENDENTE)
  roles       Role[]
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Role {
  id          String       @id @default(uuid())
  name        String       @unique
  description String?
  users       User[]
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Permission {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  users       User[]
  roles       Role[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
