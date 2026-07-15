# Configurações do Antigravity

Este arquivo serve como um índice e documentação das regras e habilidades (skills) ensinadas ao agente para este projeto. O motor do Antigravity carrega as regras listadas aqui e injeta no contexto.

## Regras Globais (Rules)
As regras de comportamento, estilo de código e restrições estão modularizadas na pasta `.agents/rules/`:

- **[Lint e Estilo](file:///Users/gustavo/projects/nest-template/.agents/rules/lint.md)**: Padrões extraídos do `eslint.config.mjs` do projeto.
- **[Comandos Permitidos](file:///Users/gustavo/projects/nest-template/.agents/rules/commands.md)**: Lista de comandos aprovados para uso no projeto (make, npm, etc).
- **[Arquivos Proibidos](file:///Users/gustavo/projects/nest-template/.agents/rules/forbidden-files.md)**: Lista de arquivos contendo segredos (como `.env`) que não devem ser lidos em hipótese alguma.
- **[Padrões de Commit](file:///Users/gustavo/projects/nest-template/.agents/rules/commits.md)**: Diretrizes para padronização de commits (Conventional Commits).
- **[Nomenclatura de Branches](file:///Users/gustavo/projects/nest-template/.agents/rules/branches.md)**: Padrão de nomenclatura para criação de novas branches (Conventional Branch).
- **[Padrões de Validação](file:///Users/gustavo/projects/nest-template/.agents/rules/validation.md)**: Regras que garantem uso do Zod e proíbem class-validator.
- **[Logs e Observabilidade](file:///Users/gustavo/projects/nest-template/.agents/rules/logging.md)**: Obriga uso do Pino, proíbe console.log e restringe PII.
- **[Arquitetura (DDD)](file:///Users/gustavo/projects/nest-template/.agents/rules/architecture.md)**: Garante separação e coesão do domínio.
- **[Padrões de API e Versionamento](file:///Users/gustavo/projects/nest-template/.agents/rules/api-standards.md)**: Validação explícita da rota (V1, V2) e retornos padronizados.

## Habilidades (Skills)
As habilidades específicas e fluxos de trabalho ensinados ao agente estão na pasta `.agents/skills/`:

- **[tlc-spec-driven](file:///Users/gustavo/projects/nest-template/.agents/skills/tlc-spec-driven/SKILL.md)**: Fluxo adaptativo de planejamento e implementação de features com verificação e commits atômicos.
- **[domain-modeling](file:///Users/gustavo/projects/nest-template/.agents/skills/domain-modeling/SKILL.md)**: Disciplina para construção e manutenção do modelo de domínio do projeto.
- **[documentation-standard](file:///Users/gustavo/projects/nest-template/.agents/skills/documentation-standard/SKILL.md)**: Padrão obrigatório e tags de metadados a serem seguidos ao criar documentos Markdown de contexto.
