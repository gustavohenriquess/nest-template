---
name: documentation-standard
description: Use esta skill para aplicar o padrão de documentação do projeto sempre que for criar ou editar arquivos de documentação Markdown.
id: project-overview.documentation-standard
title: Padrao de Documentos Markdown
kind: context
category: documentation-standard
status: draft
owner: product-engineering
audience:
  - developers
  - ai-agents
tags:
  - documentation-standard
  - markdown
  - discovery
  - index
created_at: 2026-05-23
updated_at: 2026-05-23
related:
  - path: ./index.md
    label: Project Overview Index
    relation: parent
---

<!-- ai:doc id="project-overview.documentation-standard" category="documentation-standard" kind="context" status="draft" -->
<!-- ai:tags documentation-standard markdown discovery index -->
<!-- ai:audience developers ai-agents -->

# Padrao de Documentos Markdown

<!-- ai:section id="project-overview.documentation-standard.structure" category="documentation-standard" tags="markdown,index,discovery" -->

Cada arquivo de contexto deve seguir este padrao para ser facilmente encontrado por varreduras simples de arquivos Markdown:

- Frontmatter YAML no topo com `id`, `title`, `kind`, `category`, `status`, `audience`, `tags` e `related`.
- Comentario `ai:doc` com os metadados essenciais em uma linha.
- Comentario `ai:tags` com tags pesquisaveis por texto.
- Comentario `ai:section` em secoes relevantes para permitir indexacao por topico.
- Links no campo `related` para conexoes estruturadas e links Markdown no corpo quando a leitura humana precisar de navegacao direta.
- Status explicito: `draft`, `active`, `deprecated` ou `superseded`.

## Exemplo Minimo

<!-- ai:section id="project-overview.documentation-standard.example" category="documentation-standard" tags="markdown,template" -->

```md
---
id: domain.example
title: Example Context
kind: context
category: domain
status: draft
audience:
  - developers
  - ai-agents
tags:
  - domain
  - example
related: []
---

<!-- ai-example:doc id="domain.example" category="domain" kind="context" status="draft" -->
<!-- ai-example:tags domain example -->

# Example Context
```

<!-- ai:doc-end id="project-overview.documentation-standard" -->
