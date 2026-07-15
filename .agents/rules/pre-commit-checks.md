# Checklist de Validação Final (Pre-Commit/Pre-Push)

Você (Inteligência Artificial) nunca deve considerar uma alteração de código complexa finalizada ou pronta para commit sem antes assegurar autonomamente a integridade do projeto.

Antes de dar o status de "pronto", execute:
1. `npm run lint` - Para garantir que nenhuma das regras estritas do ESLint/Prettier foi violada (ex: `no-unused-vars`).
2. `npm run build` - Para garantir que a modificação Typescript compila na totalidade e não apresenta falhas de tipo.
3. `npm run test` - Para validar as garantias dos casos de uso de forma isolada.
4. `npm run test:cov` - Para gerar relatório provando que a cobertura de testes não caiu para a suíte de unitários.
