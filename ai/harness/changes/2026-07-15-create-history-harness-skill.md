# Histórico de Alterações: Criação da Skill history-harness

- **Data:** 2026-07-15
- **Objetivo da Mudança:** O usuário solicitou a criação de uma skill que atue como um histórico contínuo das ações de IA. O objetivo é que, ao pesquisar, entender ou alterar/criar arquivos, a IA documente o racional dessas ações dentro da pasta do repositório (`ai/harness/search` ou `ai/harness/changes`).

## Arquivos Modificados/Criados:
- `[NOVO] .agents/skills/history-harness/SKILL.md`
- `[MODIFICADO] .agents/AGENTS.md`

## Racional Técnico:
- Criei uma nova skill chamada `history-harness` para ditar esse comportamento e a registrei no índice global do agente.
- A skill determina que eu devo criar ativamente um arquivo Markdown com metadados básicos (Data, Objetivo, Arquivos Afetados, Racional) sempre que realizar pesquisas de fluxo de código (`ai/harness/search/`) ou implementar/modificar lógica e regras (`ai/harness/changes/`).
- Esta é a primeira evidência da skill em ação: documentando a sua própria criação!
