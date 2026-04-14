# Boas Práticas de Programação em NestJS

Este documento detalha as diretrizes e padrões recomendados para o desenvolvimento com NestJS, focando em manutenibilidade, escalabilidade e testabilidade, especialmente em projetos para o **Gemini CLI**.

## 1. Introdução e Fundamentos

### 1.1. Estilo de Código e Convenções
Aderir a um estilo de código consistente é crucial para a colaboração em equipe.

-   **Linguagem**: TypeScript é a linguagem padrão.
-   **Convenções de Nomenclatura**:
    -   `PascalCase` para classes, interfaces, enums e tipos.
    -   `camelCase` para variáveis, funções, métodos e propriedades.
    -   `kebab-case` para nomes de arquivos e diretórios.
-   **Mapeamento de Paths**: Utilizar aliases de caminho (e.g., `@/` para `src`) no `tsconfig.json`.
-   **Ferramentas**: Prettier para formatação e ESLint para linting.

### 1.2. Arquitetura Modular com NestJS
Cada funcionalidade deve ser encapsulada em seu próprio módulo.

-   **`@Module`**: Organiza componentes, importa dependências e declara controllers/providers.
-   **`@Controller`**: Gerencia requisições HTTP e roteia para casos de uso.
-   **`@Injectable`**: Marca classes para Injeção de Dependência (DI).
-   **`@Inject`**: Injeta dependências específicas ou tokens personalizados.

---

## 2. Princípios de Design e Arquitetura

### 2.1. Princípios SOLID
Fundamentais para sistemas robustos e flexíveis.

-   **S (Single Responsibility)**: Cada classe com apenas uma razão para mudar.
-   **O (Open/Closed)**: Aberto para extensão, fechado para modificação.
-   **L (Liskov Substitution)**: Subtipos devem ser substituíveis por seus tipos base.
-   **I (Interface Segregation)**: Interfaces específicas são melhores que uma geral.
-   **D (Dependency Inversion)**: Dependa de abstrações, não de implementações.

### 2.2. Arquitetura em Camadas
-   **`controllers` (Apresentação)**: Recebe requisições, valida dados e delega para a aplicação.
-   **`application` (Aplicação)**: Contém lógica de casos de uso (Use Cases) e orquestra o domínio.
-   **`domain` (Domínio)**: Regras de negócio, entidades, value objects e interfaces de repositórios.
-   **`infrastructure` (Infraestrutura)**: Implementações concretas (Prisma, GCP, Repositories).
    -   `repositories`: Interfaces e implementações.
    -   `in-memory`: Para testes unitários.
    -   `prisma`: Persistência via ORM.
    -   `gcp`: Integrações com BigQuery, Storage, etc.

### 2.3. Domain-Driven Design (DDD)
-   **Entidades**: Possuem identidade única e ciclo de vida (ex: `UniqueEntityId`).
-   **Value Objects**: Valores descritivos e imutáveis sem identidade própria.
-   **Casos de Uso (Use Cases)**: Encapsulam a lógica de negócio principal e coordenam interações.

---

## 3. Implementação e Detalhes Técnicos

### 3.1. Validação com Zod
Utilizado para validar schemas de forma declarativa e segura.

-   **`@ValidateSchema`**: Decorador customizado para integração direta em métodos.
-   **Pipes de Validação**: Interceptam e validam dados de entrada (body, params).
-   **Schemas**: Definidos em arquivos separados para reutilização.

### 3.2. Gerenciamento de Configuração
Centralizado e seguro via Injeção de Dependência.
- **Providers de Configuração**: Carregam variáveis de ambiente e parâmetros de serviços.

### 3.3. Tratamento de Erros
-   **Classes de Erro Customizadas**: Erros semânticos do domínio ou aplicação.
-   **Respostas Estruturadas**: Formato consistente em todas as respostas de erro da API.

---

## 4. Qualidade e Observabilidade

### 4.1. Testes Automatizados
-   **Unitários (`.spec.ts`)**: Testam unidades isoladas. Devem usar **in-memory databases** ou mocks (Jest).
-   **End-to-End (`.e2e-spec.ts`)**: Fluxo completo simulando interação do usuário.

### 4.2. Observabilidade e Middleware
-   **Logging**: Winston para logs padronizados e Middleware de log fixo.
-   **Tracing**: OpenTelemetry para monitorar fluxos distribuídos.
-   **Segurança**: Middleware para CORS, Helmet e políticas globais.

### 4.3. Infraestrutura (GCP)
Serviços dedicados para interagir com Cloud Storage e BigQuery de forma encapsulada.

### 4.4 Lint
-   Sempre que for fazer uma alteração que possa quebrar o lint, rodar o comando `npm run lint` para corrigir os erros.

---

## 5. Padrões de Commit (Commitlint)

Seguindo **Conventional Commits**: `tipo(escopo): descrição curta`.
- **Tipos**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- **Regras**: Minúsculas, sem ponto final, máx 72 caracteres.

---

## 6. Documentação com Gemini CLI

Ao criar novos módulos (ex: `payments`):
1. **Estrutura**: Criar `src/payments/docs`.
2. **Contexto**: Usar Gemini para ler arquivos e entender a lógica.
3. **README**: Gerar `README.md` detalhando funcionalidades e regras de negócio das entidades.
4. **API**: Documentar rigorosamente payloads e responses para facilitar integração e testes.
