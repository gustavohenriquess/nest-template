# Padrão de Nomenclatura de Branches

Sempre que criar uma nova branch neste repositório, você **deve** seguir o padrão [Conventional Branch](https://conventionalbranch.org/).

## Estrutura da Branch
O formato do nome da branch deve seguir:
```
<type>/[optional-ticket-id]-<short-description>
```
*Se não houver um ID de tarefa (como ticket do Jira ou GitHub Issue), o ID pode ser omitido, utilizando apenas `<type>/<short-description>`.*

## Tipos Permitidos (`type`):
- `feat/`: Para o desenvolvimento de uma nova funcionalidade (ex: `feat/user-login`, `feat/123-add-payment-gateway`)
- `fix/`: Para a correção de um bug (ex: `fix/crash-on-startup`, `fix/456-header-alignment`)
- `docs/`: Para atualizações focadas apenas em documentação (ex: `docs/update-readme`)
- `chore/`: Para tarefas de manutenção, atualizações de dependências ou configuração (ex: `chore/update-deps`)
- `refactor/`: Para reestruturações de código que não adicionam novas funcionalidades nem corrigem bugs (ex: `refactor/extract-auth-service`)
- `test/`: Para a adição ou correção de testes automatizados (ex: `test/add-user-service-tests`)

## Regras Importantes:
1. **Formatação**: Use sempre **kebab-case** (todas as letras minúsculas separadas por hífen `-`) para a descrição da branch.
2. **Objetividade**: A descrição deve ser curta e ir direto ao ponto, resumindo a intenção principal da branch.
3. **Caracteres**: Não utilize espaços, caracteres especiais (como `!`, `@`, `#`), letras maiúsculas ou acentos no nome da branch.
