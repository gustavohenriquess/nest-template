# Prisma e Banco de Dados

Este template utiliza o [Prisma ORM](https://www.prisma.io/) como camada principal para interagir com o banco de dados PostgreSQL.

## Arquitetura e Configuração

O serviço central do Prisma está localizado em `src/core/infrastructure/persistence/prisma/prisma.service.ts`.
Este serviço implementa os hooks de ciclo de vida do NestJS para conectar-se automaticamente ao banco de dados na inicialização e desconectar-se de forma graciosa ao desligar a aplicação.

### 1. Conectando (`OnModuleInit`)
Durante o startup, o `$connect()` é executado. Se falhar, a aplicação irá "crashar" explicitamente, evitando um estado de API "zumbi" (onde o servidor web está online, mas o banco está inalcançável).

### 2. Desconectando (`OnModuleDestroy`)
Ao desligar a aplicação graciosamente (ex: via sinal SIGTERM), o `$disconnect()` garante que todos os pools de conexão sejam devidamente encerrados.

## Trabalhando com Prisma

### O Schema
Seus modelos de dados devem ser definidos no arquivo `prisma/schema.prisma`. 
Após atualizar modelos, você deve gerar o client:
```bash
npx prisma generate
```

### Migrations
Para enviar alterações de forma segura em ambiente de desenvolvimento:
```bash
npx prisma migrate dev --name <nome-da-migracao>
```

Para deploy em produção, o pipeline CI/CD ou o entrypoint do Docker deve executar:
```bash
npx prisma migrate deploy
```

## Testes E2E com Prisma
Nós usamos um ambiente de banco de dados isolado para testes E2E, a fim de evitar corromper os dados de desenvolvimento.
1. As variáveis `.env` apontam os testes para um schema ou banco distinto.
2. Nós limpamos as tabelas do banco antes de executar cada suite de testes para garantir a idempotência.
3. A lógica de "seeding" (inserção inicial de dados) pode ser adicionada em `test/utils/e2e-helper.ts` para pré-popular dados necessários para os testes.
