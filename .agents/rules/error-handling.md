# Tratamento de Erros e Exceções

A aplicação deve conter um tratamento semântico de erros, separando as regras de negócio das regras de protocolo HTTP.

- **Domain Errors Customizados:** Na camada de `domain` e `application` (UseCases), nunca levante exceções HTTP diretas (como `BadRequestException`, `NotFoundException` ou `HttpException`). Você deve utilizar ou criar Classes de Erro Customizadas de Domínio que herdam da classe base de erro do projeto (ex: `EntityNotFoundError`, `ConflictError`).
- **Respostas Estruturadas:** Os erros de domínio gerados nos Use Cases devem ser capturados e traduzidos adequadamente pelas Controllers ou, idealmente, pelos `ExceptionFilters` globais para garantir que a resposta HTTP chegue ao cliente num formato JSON padronizado e não vaze exceções brutas.
