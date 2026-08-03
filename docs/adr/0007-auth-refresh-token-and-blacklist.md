---
id: adr.auth.refresh-token-blacklist
title: "ADR 0007: Estratégia de Refresh Token e Blacklist"
kind: adr
category: auth
status: accepted
audience:
  - developers
  - ai-agents
tags:
  - adr
  - auth
  - refresh-token
  - blacklist
  - redis
  - postgresql
related:
  - path: ./0001-auth-module-architecture.md
    label: ADR 0001 - Auth Module Architecture
    relation: extends
---

<!-- ai:doc id="adr.auth.refresh-token-blacklist" category="auth" kind="adr" status="accepted" -->
<!-- ai:tags adr auth refresh-token blacklist redis postgresql -->
<!-- ai:audience developers ai-agents -->

# ADR 0007: Estratégia de Refresh Token e Blacklist

## Contexto
O módulo de autenticação (`AuthModule`) atualmente adota um modelo *stateless* utilizando JSON Web Tokens (JWT) com validade de 1 dia (conforme descrito no ADR 0001). Embora garanta escalabilidade horizontal e performance, esta abordagem apresenta uma grave limitação de segurança: não permite a revogação imediata de um acesso (ex: logout forçado, roubo de dispositivo, banimento) sem alterar a chave secreta global.

Para sanar este problema sem sacrificar os benefícios da arquitetura *stateless* em cada requisição (alta performance), tornou-se necessário projetar um sistema híbrido utilizando Access Tokens curtos, Refresh Tokens e uma Blacklist em memória. Além disso, precisávamos garantir rastreabilidade completa (auditoria) e suporte a múltiplos logins simultâneos do mesmo usuário (múltiplas sessões).

## Decisão
Decidimos implementar uma arquitetura de segurança híbrida estruturada da seguinte forma:

1. **Access Tokens de Vida Curta**: O tempo de validade do JWT (Access Token) será reduzido (ex: 15 minutos). Este token continua sendo avaliado de forma *stateless* nas rotas protegidas (via validação de assinatura local).
2. **Refresh Tokens no Banco Relacional (PostgreSQL)**: Ao realizar o login, o usuário receberá um *Refresh Token* de longa duração (ex: 7 dias). 
   - Esse token será persistido em uma tabela relacional no PostgreSQL (ex: `RefreshToken`), com relacionamento para o `User`.
   - Essa tabela conterá metadados da sessão, como `ipAddress`, `userAgent`, `createdAt`, `expiresAt`, `revokedAt`, possibilitando total auditoria e controle fino por dispositivo.
   - Cada usuário poderá ter várias sessões simultâneas (uma linha por dispositivo).
3. **Blacklist no Redis para Revogação Imediata**: Para suprir a janela de vulnerabilidade do *Access Token* (até 15 minutos) durante um cenário de logout explícito ou bloqueio imediato, o token ainda válido será armazenado no Redis. 
   - O tempo de vida (TTL) no Redis será igual ao tempo restante de validade do token.
   - O `AuthGuard` global será adaptado para realizar uma checagem extremamente rápida em O(1) ("O token está no Redis?") antes de autorizar a requisição, barrando acessos imediatamente.

## Consequências

### Positivas
- **Segurança Reforçada**: Redução drástica da janela de vulnerabilidade de um token comprometido (max. 15 min de autonomia).
- **Revogação Instantânea (Kill-switch)**: O uso do Redis como Blacklist permite deslogar usuários imediatamente, sem onerar o banco de dados principal.
- **Auditoria e Observabilidade**: O armazenamento de sessões no PostgreSQL oferece o histórico completo de logins, IPs e dispositivos dos usuários.
- **Múltiplos Dispositivos Seguros**: Usuários podem revogar sessões individuais (ex: "Deslogar de todos os outros dispositivos") sem afetar seu uso atual.
- **Performance Mantida**: O banco relacional só será consultado a cada 15 minutos (no momento do refresh), e o Redis responderá na casa dos microssegundos em toda requisição, mantendo a latência baixa.

### Negativas
- **Complexidade Extra**: Requer a manutenção de rotinas de expiração e limpeza no banco de dados para evitar acúmulo de Refresh Tokens mortos ao longo dos anos.
- **Infraestrutura**: Adiciona a obrigatoriedade explícita de um servidor Redis rodando no ecossistema (antes ele não era mandatório para a funcionalidade básica de login).
