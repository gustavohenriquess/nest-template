# Dicas de Escalonamento de Pipelines (CI)

Este documento contém estratégias recomendadas para quando este projeto crescer significativamente em volume de código e testes.

## 1. Separação de Testes Unitários e Coverage

Atualmente, unificamos os testes em um único comando `npm run test:cov` para economizar recursos. Porém, se o tempo de execução ultrapassar 5-10 minutos, recomendamos a separação no `main.yml`:

```yaml
# Exemplo de pipeline encadeada (Chained Workflow)
jobs:
  setup:
    uses: ./.github/workflows/_setup.yml

  unit-tests:
    needs: setup
    uses: ./.github/workflows/_unit-tests.yml

  coverage:
    needs: unit-tests # Só roda se os unitários passarem
    uses: ./.github/workflows/_coverage.yml
```

**Por que fazer isso?**
Economiza "CI Minutes". Se um teste unitário quebrar, o GitHub nem inicia o job de Coverage, que é computacionalmente mais caro.

## 2. Otimização com `--onlyChanged`

Em Pull Requests muito grandes, você pode configurar o job de `unit-tests` para rodar apenas o que mudou, mantendo o `coverage` para rodar a suíte completa:

```bash
# No workflow de testes unitários rápidos
jest --onlyChanged
```

## 3. Matriz de Versões de Node.js

Para garantir compatibilidade com versões futuras, você pode usar o recurso de `matrix` do GitHub Actions:

```yaml
strategy:
  matrix:
    node-version: [24, 26]
```

## 4. Fail-Fast para Testes E2E

Sempre mantenha os testes E2E dependentes do `quality` (Lint/Build). Não faz sentido subir containers de banco de dados se o código nem sequer compila.

```yaml
e2e-tests:
  needs: [setup, quality]
  uses: ./.github/workflows/_e2e-tests.yml
```
