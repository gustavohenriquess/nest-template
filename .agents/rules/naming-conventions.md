# Padrões de Nomenclatura e Estilo

A padronização do código-fonte é essencial para o motor de busca e a colaboração. Sempre aplique as seguintes convenções de nomenclatura:

- **Classes, Interfaces, Enums e Tipos:** Devem ser nomeadas em `PascalCase`.
- **Variáveis, Funções, Métodos e Propriedades:** Devem ser nomeadas em `camelCase`.
- **Nomes de Arquivos e Diretórios:** Devem ser estritamente em `kebab-case` (ex: `create-user.use-case.ts`).
- **Mapeamento de Paths (Imports):** Sempre utilize aliases absolutos (ex: `@/core/...` ou o atalho do módulo) configurados no `tsconfig.json`. Evite severamente caminhos relativos longos ou complexos (ex: `../../../core`).
