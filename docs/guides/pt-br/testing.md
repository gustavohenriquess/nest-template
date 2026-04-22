# Estratégia de Testes

A qualidade é inegociável em uma aplicação Enterprise. Este template está configurado para rejeitar qualquer PR ou commit que faça a cobertura total de testes cair abaixo de 90%.

## 1. Testes Unitários (`*.spec.ts`)
Os testes unitários coabitam com seus arquivos de implementação. Usamos `jest` para mocks e asserções.
- Foco em testar a lógica de negócios isolada nas camadas de `domain` e `application`.
- Evite testar especificidades do framework (como controllers) em testes unitários; deixe isso para os E2E.

**Rodar Testes Unitários:**
```bash
npm run test
```

## 2. Testes End-to-End (E2E) (`test/*.e2e-spec.ts`)
Testes E2E simulam requisições HTTP reais contra a aplicação NestJS totalmente compilada.

### Isolamento de Banco de Dados
Testes E2E NUNCA devem rodar contra o banco de dados de desenvolvimento.
1. O `.env.test` (ou setup dinâmico) sobrescreve a URL do banco para apontar para um banco de testes.
2. Limpamos as tabelas antes de cada suíte para evitar vazamento de estado entre os testes.

### Mockando Provedores Externos (GCP)
Não queremos que os testes falhem porque o Google Cloud caiu ou porque credenciais expiraram.
Verifique o `test/utils/e2e-helper.ts`. O `E2EHelper` intercepta a árvore de injeção de dependência e troca as instâncias reais de `PubSubService`, `BigQueryService` e `StorageService` por mocks (`jest.fn()`).

**Rodar Testes E2E:**
```bash
npm run test:e2e
```

## 3. Barreira de Cobertura (Coverage Gate)
Para visualizar o relatório de cobertura localmente:
```bash
npm run test:cov
```
Isso gera um relatório HTML na pasta `coverage/`. O pipeline do GitHub Actions roda este comando automaticamente e falha a build se a meta de 90% não for atingida.
