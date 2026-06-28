# Arquitetura e Padrões do Projeto

Este documento registra as decisões arquiteturais e padrões de código estabelecidos para a API do projeto.

## 1. Stack Tecnológica
- **Runtime:** Bun (escolhido pela altíssima performance, velocidade de startup e ferramentas nativas como test runner e compatibilidade TS).
- **Framework Web:** 
  - *Atual:* Express (v5) - Estável, suporta async errors nativamente.
  - *Transição/Experimental:* Hono - Sendo o framework nativo do Bun, traz melhor performance, uso de *Web Standards* e tipagem de ponta a ponta.
- **Banco de Dados & ORM:** PostgreSQL com **Drizzle ORM**. O Drizzle fornece um modelo muito próximo ao SQL puro, mantendo total segurança de tipos sem o *overhead* de ORMs baseados em classes (como TypeORM/Prisma).
- **Validação:** Zod (integrado aos middlewares/rotas para tipagem automática do corpo e query das requisições).

## 2. Estrutura e Organização
- **Fatiamento Vertical (Vertical Slicing):** O código é organizado por **domínios** (`src/modules/agents`, `src/modules/tickets`, etc.). Isso evita agrupar "todos os controllers" ou "todos os services" juntos, permitindo que a aplicação cresça de forma coesa.
- **Path Aliases:** Utiliza-se o prefixo `@/` para apontar para a raiz da pasta `src/`, evitando o "inferno dos caminhos relativos" (ex: `../../`).

## 3. Padrões de Código e Paradigma
O projeto segue uma abordagem **pragmática e funcional**, inspirada na filosofia do Golang (simplicidade, clareza e pouca "mágica").

- **Named Exports vs Default Exports:** 
  - Foi adotado o padrão de **Named Exports** (`export async function nomeDaFuncao`) ao invés de exportar objetos literais gigantes (`export default { ... }`). 
  - Isso facilita a legibilidade, resolve problemas de escopo (`this`) e favorece o *Tree-Shaking*.
- **Injeção de Dependências (DI):** 
  - Evitamos contêineres de DI complexos ou uso excessivo de classes (como no NestJS). 
  - As dependências (ex: banco de dados) são importadas diretamente no topo dos arquivos (*Closure-based* ou importação simples). Isso prioriza a facilidade de leitura e evita boilerplate.
  - O paradigma é mantido simples.

## 4. Responsabilidades
- **Controllers Finos ("Burros"):** A única responsabilidade do controller é extrair os dados da requisição, acionar a validação, repassar para o Service e devolver a resposta formatada. **Nunca** inserir regras de negócio ou queries SQL diretamente no controller.
- **Services Focados:** O Service contém a lógica de negócios e chamadas ao Drizzle. Se um Service (ex: `AgentService`) crescer demais, ele deve ser dividido em arquivos menores com funções específicas (ex: `CreateAgent.ts`, `ListAgents.ts`), prevenindo o anti-pattern de "Deus Service".
- **Acesso a Dados:** As queries são feitas diretamente com o Drizzle ORM nos Services. Evita-se a criação de repositórios genéricos (`BaseRepository`) que tendem a esconder a clareza das consultas SQL.

## 5. Validações e Tratamento de Erros
- Validações são feitas com **Zod**. Em caso de migração total para Hono, utiliza-se o `@hono/zod-validator` no nível da rota para que os dados cheguem aos controllers perfeitamente tipados.
- Erros são tratados globalmente, capturando exceções de validação (`ValidationException`), erros HTTP padronizados (`HttpException`) e tratando erros do banco de dados (ex: chaves estrangeiras, violação de unicidade) convertendo-os em status HTTP adequados de forma centralizada.
