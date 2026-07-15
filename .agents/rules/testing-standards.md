# Padrões de Testes Automatizados

A estratégia de testes garante a estabilidade e previsibilidade do código. Diferencie estritamente as regras arquiteturais entre testes Unitários e E2E:

- **Testes Unitários (`.spec.ts`)**: 
  - Testam unidades de código completamente isoladas (ex: Use Cases, Entidades).
  - **Obrigatoriedade:** Devem rodar inteiramente na memória de forma veloz.
  - **Restrição:** NUNCA conecte ao banco de dados real nestes arquivos (ex: não instancie o `PrismaService` verdadeiro). Injeções de dependência que demandem I/O devem ser supridas através de implementações falsas **In-Memory** ou **Mocks (Jest)** assinando o mesmo contrato da interface.
  
- **Testes End-to-End (`.e2e-spec.ts`)**:
  - Validam o fluxo completo desde a requisição HTTP batendo na Controller até a resposta final.
  - Estes sim, levantam e interagem com a camada de infraestrutura/Prisma real num esquema provisório.
