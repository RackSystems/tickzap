# Tickzap AI

O serviço `tickzap-ai` funcionará como um agente de IA _stateless_ e _multi-tenant_. Ele receberá tickets de suporte via webhooks (por exemplo, vindos do gateway de WhatsApp ou da API principal), processará e anonimizará os dados locais para LGPD, consultará a base de conhecimento específica do cliente (_tenant_) usando vetores e responderá com a melhor ação estruturada (categoria, roteamento e satisfação).

## 🛠️ Stack Tecnológica Recomendada

- **Runtime:** [Bun](https://bun.sh/) (ultra-rápido, suporte nativo a TypeScript).
- **Framework Web:** [Hono](https://hono.dev/) (leve, ótimo suporte para Bun).
- **Framework de IA:** [Vercel AI SDK](https://sdk.vercel.ai/) (suporta de forma agnóstica a troca dinâmica de provedores).
- **AI Providers:**
  - **Local:** [Ollama](https://ollama.com/) ou [vLLM](https://github.com/vllm-project/vllm).
  - **Nuvem:** OpenAI (`@ai-sdk/openai`), Anthropic (`@ai-sdk/anthropic`), Google Gemini (`@ai-sdk/google`).
- **Banco Vetorial:** PostgreSQL com a extensão [pgvector](https://github.com/pgvector/pgvector) (reaproveitando o banco existente).
- **ORM:** [Prisma](https://www.prisma.io/) ou SQL puro (usando `pg` para máxima performance de buscas vetoriais).

## 🔒 Privacidade e Conformidade (LGPD)

1. **Remoção de PII (Personally Identifiable Information):** Antes de qualquer interação com o modelo de linguagem (LLM), o ticket passa por um utilitário `DataSanitizer` que remove CPFs, telefones, e-mails e nomes comuns, substituindo-os por marcadores (ex: `[NOME_ANONIMIZADO]`).
2. **Mitigação de Envio de Dados para Nuvem:**
   - **Com Modelos Locais:** Nenhum dado sai da infraestrutura do TickZap.
   - **Com Modelos Cloud:** A sanitização na camada local do `DataSanitizer` torna-se **crítica e obrigatória**, garantindo que apenas dados de negócios anonimizados sejam transmitidos para APIs de terceiros (como OpenAI ou Anthropic).

---

## 🛠️ Stack Tecnológica Recomendada

- **Runtime:** [Bun](https://bun.sh/) (ultra-rápido, suporte nativo a TypeScript).
- **Framework Web:** [Hono](https://hono.dev/) (leve, ótimo suporte para Bun).
- **Framework de IA:** [Vercel AI SDK](https://sdk.vercel.ai/) (suporta de forma agnóstica a troca dinâmica de provedores).
- **AI Providers:**
  - **Local:** [Ollama](https://ollama.com/) ou [vLLM](https://github.com/vllm-project/vllm).
  - **Nuvem:** OpenAI (`@ai-sdk/openai`), Anthropic (`@ai-sdk/anthropic`), Google Gemini (`@ai-sdk/google`).
- **Banco Vetorial:** PostgreSQL com a extensão [pgvector](https://github.com/pgvector/pgvector) (reaproveitando o banco existente).
- **ORM:** [Prisma](https://www.prisma.io/) ou SQL puro (usando `pg` para máxima performance de buscas vetoriais).

## 🔍 Plano de Verificação e Testes

### Verificação Automatizada:

- Testes unitários para validar a alternância de provedores com chaves mockadas.
- Testes do `DataSanitizer` para garantir 100% de expurgação de PII antes de chamar os provedores Cloud (OpenAI/Anthropic).

### Verificação Manual:

- Configurar o Tenant "A" com modelo local Ollama e o Tenant "B" com uma chave da OpenAI.
- Enviar requisições de teste e verificar nos logs que o Tenant A realiza inferência na rede interna e o Tenant B executa a chamada na nuvem de forma transparente.

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000
