---
name: history-harness
description: Triggers automatically to create a continuous documentation harness (history) of all code searches, understandings, changes, and creations requested by the user.
---

# History Harness

Esta skill tem o objetivo de manter um registro histórico contínuo de todas as interações significativas no projeto, provendo um "rastro de auditoria" persistente das decisões tomadas e dos entendimentos alcançados pela IA.

## Gatilhos de Execução (Quando usar)
Você DEVE engatilhar esta skill e agir proativamente sempre que o usuário solicitar:
1. **Entender algo**: Análise de código, debugar uma arquitetura, pesquisa de fluxo, explicação de como algo funciona.
2. **Alterar ou criar algo**: Implementação de novas features, refatorações, correções de bug, atualizações de dependências.

Sempre que uma dessas ações for executada, você deve criar um documento Markdown com o registro dessa ação.

## Regras de Armazenamento e Estrutura

### 1. Entendimento e Busca
Se a tarefa foi de investigação, busca ou entendimento, crie um arquivo na pasta:
`ai/harness/search/YYYY-MM-DD-nome-curto-do-assunto.md`

**Estrutura obrigatória do arquivo:**
- **Data:** `YYYY-MM-DD`
- **Objetivo da Busca:** O que o usuário pediu para investigar ou entender.
- **Arquivos Analisados:** Lista de quais arquivos ou pastas foram inspecionados.
- **Descobertas:** O resumo detalhado do que foi entendido (fluxos, gargalos, regras de negócio descobertas).

### 2. Alterações e Criações
Se a tarefa envolveu modificação de código, criação de arquivos ou refatoração, crie um arquivo na pasta:
`ai/harness/changes/YYYY-MM-DD-nome-curto-da-tarefa.md`

**Estrutura obrigatória do arquivo:**
- **Data:** `YYYY-MM-DD`
- **Objetivo da Mudança:** Qual era o requisito, task ou bug.
- **Arquivos Modificados/Criados:** A lista dos arquivos que sofreram impacto.
- **Racional Técnico:** O resumo das alterações feitas e o *porquê* as decisões arquiteturais ou lógicas foram tomadas daquela forma.
