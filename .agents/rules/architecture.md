# Arquitetura (DDD)

A estrutura do projeto é projetada para escala corporativa e inspirada no **Domain-Driven Design (DDD)**. 

1. **Isolamento de Domínio:** Mantenha sempre a sua regra de negócio (core) isolada de detalhes da infraestrutura. A lógica do domínio não deve conhecer a implementação específica do banco de dados (Prisma) ou os detalhes específicos da requisição HTTP (Express).
2. **Coesão:** Estruture os arquivos e serviços de forma que façam sentido para o domínio/subdomínio, utilizando agregações quando necessário, em vez de agrupar o código puramente por camada técnica.
3. **Padrões Repetíveis:** Siga os padrões estabelecidos de injeção de dependências e a estrutura proposta nas documentações do repositório para Services e Repositories.

## Princípios SOLID
Nossa arquitetura abraça os fundamentos SOLID para manter os sistemas flexíveis ao longo do tempo. Na codificação, deve-se respeitar:
- **S (Single Responsibility):** Cada classe, UseCase ou Módulo deve ter apenas uma responsabilidade estrita.
- **O (Open/Closed):** Aberto para extensão, fechado para modificação (escreva novos arquivos em vez de sobrecarregar um único serviço legado).
- **L (Liskov Substitution):** Subtipos ou implementações concretas (como repositórios do Prisma) devem ser 100% substituíveis pelas suas abstrações (Interfaces do Domain) de maneira transparente para o chamador.
- **I (Interface Segregation):** Construa interfaces focadas e segregadas para o consumo de quem injeta.
- **D (Dependency Inversion):** Você deve sempre depender de abstrações (Interfaces), nunca das implementações e bibliotecas concretas.
