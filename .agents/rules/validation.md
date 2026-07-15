# Padrões de Validação (Zod)

Neste projeto, toda a validação de entrada de dados é feita através da biblioteca **Zod**.

1. **Uso Obrigatório do Zod:** Para validação de dados de entrada (Body, Query, Params) nos endpoints, defina os schemas sempre utilizando o Zod (ex: `z.object({...})`).
2. **Integração com NestJS:** Utilize o decorador ou os Pipes customizados do projeto voltados para o Zod (como `@UseZodSchema()` mencionado na documentação) ao invés da sintaxe pura nos controllers, sempre que aplicável.
3. **Proibição Expressa:** **Nunca** utilize os pacotes tradicionais `class-validator` e `class-transformer`. Todo o sistema de DTOs e payloads de requisição é estritamente baseado no `zod`.
