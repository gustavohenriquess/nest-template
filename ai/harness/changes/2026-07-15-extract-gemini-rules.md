---
id: ai-harness.extract-gemini-rules
title: Extract GEMINI.md Rules into Agent Directives
kind: context
category: ai-harness
status: active
audience:
  - developers
  - ai-agents
tags:
  - ai-harness
  - rules
  - refactor
  - gemini
related: []
---

<!-- ai:doc id="ai-harness.extract-gemini-rules" category="ai-harness" kind="context" status="active" -->
<!-- ai:tags ai-harness rules refactor gemini -->

# Extract GEMINI.md Rules into Agent Directives

<!-- ai:section id="ai-harness.extract-gemini-rules.details" category="ai-harness" tags="rules,refactor,gemini" -->

- **Objetivo da Mudança:** O usuário solicitou a análise do arquivo legado `.gemini/GEMINI.md` para extrair boas práticas de programação e transformá-las em regras de agente (rules) vivas na pasta `.agents/rules/`.
- **Arquivos Modificados/Criados:**
  - `[NOVO] .agents/rules/naming-conventions.md`
  - `[NOVO] .agents/rules/error-handling.md`
  - `[NOVO] .agents/rules/testing-standards.md`
  - `[NOVO] .agents/rules/pre-commit-checks.md`
  - `[MODIFICADO] .agents/rules/architecture.md` (Princípios SOLID anexados)
  - `[MODIFICADO] .agents/AGENTS.md` (Atualizado com o índice das novas regras)
- **Racional Técnico:** Os princípios listados no arquivo GEMINI.md são excelentes práticas globais, mas estavam escondidos e não injetados dinamicamente no contexto do agente. Transformá-los em `.md` individuais dentro de `.agents/rules/` forçará a engine de IA a aplicar automaticamente padrões de nomenclatura, tratamento de exceções de domínio, injeções falsas em testes unitários e rodar os linters remotamente antes de cada entrega final. A seção de SOLID foi aglutinada junto à arquitetura para coesão de domínio.

**Solicitado por:** gustavo._henrique@exemplo.com

<!-- ai:doc-end id="ai-harness.extract-gemini-rules" -->
