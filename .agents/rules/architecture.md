# Arquitetura (DDD)

A estrutura do projeto é projetada para escala corporativa e inspirada no **Domain-Driven Design (DDD)**. 

1. **Isolamento de Domínio:** Mantenha sempre a sua regra de negócio (core) isolada de detalhes da infraestrutura. A lógica do domínio não deve conhecer a implementação específica do banco de dados (Prisma) ou os detalhes específicos da requisição HTTP (Express).
2. **Coesão:** Estruture os arquivos e serviços de forma que façam sentido para o domínio/subdomínio, utilizando agregações quando necessário, em vez de agrupar o código puramente por camada técnica.
3. **Padrões Repetíveis:** Siga os padrões estabelecidos de injeção de dependências e a estrutura proposta nas documentações do repositório para Services e Repositories.
