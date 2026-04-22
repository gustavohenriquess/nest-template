# CI/CD e Automação de Releases

Este projeto evita tarefas DevOps manuais. Tudo, desde a aplicação da qualidade de código até o versionamento e releases, é totalmente automatizado via GitHub Actions e `standard-version`.

## 1. Pipelines Modulares
Em vez de um arquivo YAML gigantesco, nossos fluxos de trabalho são modulares e reutilizáveis (`.github/workflows/`):

- `main.yml`: O orquestrador central.
- `_setup.yml`: Instala o Node.js e faz cache dos módulos `npm`.
- `_quality.yml`: Roda Prettier, ESLint e checa a barreira de 90% de cobertura.
- `_tests.yml` & `_e2e-tests.yml`: Levanta bancos de dados e executa suítes Unit/E2E.
- `_release.yml`: Roda especificamente quando uma tag é "pushed", criando uma Release oficial no GitHub.

## 2. Gerando uma Release

Nós usamos [standard-version](https://github.com/conventional-changelog/standard-version) e Conventional Commits (`feat:`, `fix:`, etc.) para calcular incrementos de versão SemVer.

Quando você estiver pronto para lançar o estado atual da `main`:

1. Garanta que sua árvore do git está limpa (clean).
2. Rode a macro de release:
   ```bash
   make release
   ```
3. **O que acontece por trás dos panos:**
   - A versão no `package.json` é incrementada automaticamente.
   - O `CHANGELOG.md` na raiz é atualizado.
   - Uma versão histórica do changelog é arquivada em `docs/changelogs/vX.X.X.md`.
   - Um git commit e uma tag anotada (ex: `v1.2.0`) são gerados.
   - Os commits e tags são enviados (push) para o remoto.
   - O GitHub Actions intercepta a tag e dispara o `_release.yml`, criando a página pública de release no GitHub.

## 3. Gestão de Dependências
Este template integra com o [Renovate Bot](https://docs.renovatebot.com/) para varrer e criar Pull Requests automaticamente para dependências npm desatualizadas, garantindo que o projeto nunca apodreça ao longo do tempo.

## 4. Dicas de Escalonamento (Scaling Tips)

À medida que o projeto crescer em volume de testes, considere estas estratégias:

### Separação de Coverage
Se o tempo de CI ultrapassar 5 minutos, separe os testes unitários do cálculo de cobertura para economizar minutos de execução (Fail-Fast):
```yaml
coverage:
  needs: unit-tests # Só roda se os unitários passarem
  uses: ./.github/workflows/_coverage.yml
```

### Otimização com `--onlyChanged`
Em Pull Requests gigantes, você pode configurar o Jest para testar apenas o que mudou:
```bash
jest --onlyChanged
```

### Matriz de Node.js
Para garantir estabilidade futura em várias versões do Node:
```yaml
strategy:
  matrix:
    node-version: [24, 26]
```
