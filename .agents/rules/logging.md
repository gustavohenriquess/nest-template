# Logs e Observabilidade

O projeto conta com um sistema avançado de rastreabilidade (OpenTelemetry) e estruturação de logs em JSON utilizando o **Pino**.

1. **Sempre utilize o Logger do Projeto:** Para qualquer log de debug, aviso ou erro estruturado, faça a injeção do serviço de Logger configurado pelo NestJS/Pino.
2. **Uso Proibido de Console:** **Nunca** utilize chamadas diretas como `console.log`, `console.error`, ou `console.info`.
3. **Proteção de Dados Sensíveis (PII):** Ao imprimir objetos inteiros, garanta a segurança dos dados. Oculte/anonimize ou evite de logar dados sensíveis de usuários (PII - senhas, tokens inteiros, cartões de crédito, documentos pessoais).

4. **Log antes de lançar exceções** – Sempre registre o erro (nível `error`) antes de lançar um `throw`. Use o logger injetado (`Logger`/`nestjs-pino`) ou um helper (ex.: `DomainError`) para garantir visibilidade nos logs de observabilidade.
