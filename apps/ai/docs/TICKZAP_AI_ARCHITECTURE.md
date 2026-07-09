# 🏗️ Arquitetura TickZap AI Service - Vercel AI SDK

**Versão**: 1.0  
**Data**: 2026-06-30  
**Stack**: TypeScript, Bun, Hono, Vercel AI SDK  
**Status**: Plano Arquitetural

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Análise Comparativa](#análise-comparativa)
3. [Arquitetura Proposta](#arquitetura-proposta)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Tópicos da Documentação Vercel AI SDK](#tópicos-da-documentação-vercel-ai-sdk)
6. [Padrões de Implementação](#padrões-de-implementação)
7. [Estratégia de Escalabilidade](#estratégia-de-escalabilidade)
8. [Integração com Outros Serviços](#integração-com-outros-serviços)
9. [Roadmap de Implementação](#roadmap-de-implementação)

---

## 🎯 Visão Geral

### Problema Atual (TickZap-AI Python)

O serviço current (Python + FastAPI + Agno) apresenta:

- ❌ **Integração limitada**: Acoplado a um único stack (Python/FastAPI)
- ❌ **Escalabilidade manual**: Sem abstrações para multi-tenant
- ❌ **Dependência de framework específico**: Agno não é agnóstico a provedores
- ❌ **Falta de tipagem forte**: Documentação gerada dinamicamente
- ❌ **Stateless sem rastreabilidade**: Sem observabilidade built-in
- ❌ **Acoplamento ao WhatsApp**: Webhook específico, difícil de reusar

### Solução Proposta (TickZap-AI v2)

Stack moderno, agnóstico e escalável:

- ✅ **Vercel AI SDK**: Abstração unificada para 25+ provedores
- ✅ **Multi-tenant native**: Isolamento automático, configuração por tenant
- ✅ **Type-safe em TypeScript**: Completo type-safety, autocompletar
- ✅ **Framework agnóstico**: Hono como adapter, facilmente portável
- ✅ **Observabilidade built-in**: DevTools integrado, rastreamento completo
- ✅ **Padrão de Runs & Steps**: Estruturação clara de execução de agentes
- ✅ **Tool Calling nativo**: Suporte automático a function calling
- ✅ **Escalável**: Preparado para Kubernetes, BullMQ, cache distribuído

---

## 📊 Análise Comparativa

### Arquitetura Python (Atual)

```
┌─────────────────────────────────────┐
│   FastAPI + Uvicorn                 │
├─────────────────────────────────────┤
│   Agno Framework                    │
├─────────────────────────────────────┤
│   OpenAI API / Integração WhatsApp  │
├─────────────────────────────────────┤
│   Stateless (sem persistência)      │
└─────────────────────────────────────┘
```

**Limitações**:

- Agno é framework-specific
- Sem multi-tenant nativo
- Sem integração com outros provedores além OpenAI
- Webhook rígido para WhatsApp
- Sem observabilidade estruturada

### Arquitetura TypeScript com Vercel AI SDK (Proposto)

```
┌──────────────────────────────────────────────┐
│        Hono Web Framework                    │
├──────────────────────────────────────────────┤
│   TenantAgentManager (Orquestração)          │
│   ├─ Session Management per Tenant           │
│   ├─ Knowledge Base Management               │
│   └─ Privacy Enforcement (LGPD)              │
├──────────────────────────────────────────────┤
│   Vercel AI SDK (Agnóstico)                  │
│   ├─ generateText / streamText               │
│   ├─ Tool Calling nativo                     │
│   ├─ Message handling estruturado            │
│   └─ Output structuring (Zod)                │
├──────────────────────────────────────────────┤
│   Provider Layer                             │
│   ├─ @ai-sdk/openai (CloudAI)                │
│   ├─ @ai-sdk/anthropic (Claude)              │
│   ├─ @ai-sdk/google (Gemini)                 │
│   ├─ @ai-sdk/ollama (Local)                  │
│   └─ @ai-sdk/mistral (Mistral)               │
├──────────────────────────────────────────────┤
│   Data Persistence & Observability           │
│   ├─ PostgreSQL (banco: tickzap_ai)          │
│   ├─ pgvector (no banco tickzap_ai)          │
│   ├─ Redis (Cache & Sessions)                │
│   ├─ Vercel AI DevTools                      │
│   └─ Audit Logs (LGPD)                       │
└──────────────────────────────────────────────┘
```

**Vantagens**:

- ✅ Agnóstico: trocar provedores sem reescrever lógica
- ✅ Multi-tenant: isolamento automático
- ✅ TypeScript: type-safe, autocompletar em IDE
- ✅ Observabilidade: DevTools built-in
- ✅ Escalável: preparado para crescimento
- ✅ Reutilizável: integrate com qualquer API via Hono

---

## 🏛️ Arquitetura Proposta

### Camadas da Aplicação

#### 1. **API Layer (Hono Adapter)**

Endpoint agnóstico para qualquer consumidor (WhatsApp, Web, Mobile, etc)

```
POST /api/v1/{tenantId}/process
GET  /api/v1/{tenantId}/knowledge-base
POST /api/v1/{tenantId}/feedback
GET  /api/v1/{tenantId}/analytics
```

#### 2. **Agent Orchestration Layer (TenantAgentManager)**

Gerencia agentes por tenant com sessões persistentes

- **Session Management**: Mantém contexto entre requisições
- **Multi-tenant Isolation**: Chaves de tenant garantem isolamento
- **Provider Selection**: Escolhe modelo/provedor dinamicamente
- **Tool Management**: Carrega tools específicas por tenant

#### 3. **LLM Integration Layer (Vercel AI SDK)**

Abstração agnóstica para qualquer provedor

- **Model Initialization**: Dynamic provider instantiation
- **Message Handling**: Estruturação de conversas
- **Tool Calling**: Execução automática de tools
- **Output Structuring**: Validação com Zod schemas

#### 4. **Custom Tools Layer**

Ferramentas específicas do negócio

- `CategorizeTool`: Classificar tickets
- `RoutingTool`: Encaminha para equipe correta
- `SatisfactionAnalyzerTool`: Avalia satisfação
- `PatternExtractorTool`: Identifica padrões
- `KnowledgeRetrieverTool`: Busca knowledge base

#### 5. **Data Persistence Layer**

Persistência, cache e auditoria

- **PostgreSQL** (`tickzap_ai`): banco dedicado ao serviço AI — chat history, patterns, metrics. Isolado do banco da API (`tickzap`).
- **pgvector**: extensão instalada no banco `tickzap_ai` para embeddings RAG
- **Redis**: Cache de sessões ativas
- **Audit Logs**: Compliance LGPD

---

## 📂 Estrutura de Diretórios

```
tickzap-ai-sdk/
├── src/
│   ├── index.ts                          # Entrada principal (Hono server)
│   │
│   ├── config/
│   │   ├── env.ts                        # Validação de env vars com Zod
│   │   ├── providers.ts                  # Configuração de provedores
│   │   └── constants.ts                  # Constantes globais
│   │
│   ├── api/
│   │   ├── routes.ts                     # Definição de rotas Hono
│   │   ├── middleware/
│   │   │   ├── auth.ts                   # Validação de API key
│   │   │   ├── tenantId.ts               # Extração de tenant
│   │   │   └── errorHandler.ts           # Tratamento de erros
│   │   └── handlers/
│   │       ├── processTicket.ts          # POST /process
│   │       ├── getKnowledgeBase.ts       # GET /knowledge-base
│   │       ├── submitFeedback.ts         # POST /feedback
│   │       └── getAnalytics.ts           # GET /analytics
│   │
│   ├── agents/
│   │   ├── TenantAgentManager.ts         # Orquestração principal
│   │   ├── TicketProcessingAgent.ts      # Agent para processar tickets
│   │   ├── KnowledgeAgent.ts             # Agent para retrieval
│   │   └── SessionManager.ts             # Gerencia sessões por tenant
│   │
│   ├── tools/
│   │   ├── index.ts                      # Exporta todos os tools
│   │   ├── categorize.ts                 # Categorização de tickets
│   │   ├── routing.ts                    # Roteamento inteligente
│   │   ├── satisfaction.ts               # Análise de satisfação
│   │   ├── patternExtractor.ts           # Extração de padrões
│   │   └── knowledgeRetriever.ts         # Busca knowledge base
│   │
│   ├── services/
│   │   ├── db/
│   │   │   ├── client.ts                 # Cliente PostgreSQL
│   │   │   ├── schema.ts                 # Definições de tabelas
│   │   │   ├── migrations.ts             # Migrations com script
│   │   │   └── queries.ts                # Query builders reutilizáveis
│   │   │
│   │   ├── cache/
│   │   │   ├── client.ts                 # Cliente Redis
│   │   │   └── sessions.ts               # Cache de sessões
│   │   │
│   │   ├── vectorstore/
│   │   │   ├── embeddings.ts             # Geração de embeddings
│   │   │   ├── search.ts                 # Busca vetorial
│   │   │   └── ingest.ts                 # Ingestão de conhecimento
│   │   │
│   │   ├── llm/
│   │   │   ├── providers.ts              # Factory de provedores
│   │   │   ├── modelSelector.ts          # Seleção dinâmica de modelo
│   │   │   └── callbackHandlers.ts       # Callbacks de execução
│   │   │
│   │   └── privacy/
│   │       ├── sanitizer.ts              # Remove PII (LGPD)
│   │       ├── encryption.ts             # Criptografia de sensíveis
│   │       └── auditLog.ts               # Logs de compliance
│   │
│   ├── types/
│   │   ├── index.ts                      # Tipos globais
│   │   ├── agent.ts                      # Types de agentes
│   │   ├── tenant.ts                     # Types de tenant
│   │   ├── ticket.ts                     # Types de ticket
│   │   └── tools.ts                      # Tipagem de tools
│   │
│   └── utils/
│       ├── logger.ts                     # Logging estruturado
│       ├── validation.ts                 # Validação com Zod
│       └── helpers.ts                    # Utilitários gerais
│
├── tests/
│   ├── unit/
│   │   ├── tools/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── integration/
│   │   ├── agents.test.ts
│   │   └── routes.test.ts
│   │
│   └── fixtures/
│       ├── mocks.ts
│       └── testData.ts
│
├── migrations/
│   ├── 001_init_schema.sql
│   ├── 002_pgvector.sql
│   └── 003_audit_logs.sql
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── .env.local (ignored)
├── package.json
├── tsconfig.json
├── biome.json                            # Linter + formatter (Bun)
├── bunfig.toml                           # Configuração Bun
└── README.md
```

**Princípios de Organização**:

- **Por Feature**: `agents/`, `tools/`, `services/` são features distintas
- **Separação de Concerns**: API, orquestração e persistência isoladas
- **Type Safety**: Tipos centralizados em `types/`
- **Testabilidade**: Fácil mockar e testar componentes
- **Escalabilidade**: Preparado para crescimento

---

## 📚 Tópicos da Documentação Vercel AI SDK

### Documentação Essencial (Ordem de Leitura)

#### 1. **[Core Concepts](https://ai-sdk.dev/docs/ai-sdk-core)** ⭐⭐⭐ CRÍTICO

Fundação do SDK:

- [ ] Getting Started
- [ ] Model Configuration
- [ ] API Overview (generateText, streamText)
- [ ] Message Handling
- [ ] System Prompts & Instructions
- [ ] DevTools Setup

**Por que**: Define como inicializar, configurar e interagir com modelos

---

#### 2. **[Agents](https://ai-sdk.dev/docs/agents)** ⭐⭐⭐ CRÍTICO

Padrão de agents com loops:

- [ ] Agent Patterns
- [ ] Tool Use (Function Calling)
- [ ] Multi-step Execution
- [ ] State Management

**Por que**: Implementar o `TenantAgentManager` com padrão correto

---

#### 3. **[Tool Calling](https://ai-sdk.dev/docs/tools/tool-calling)** ⭐⭐⭐ CRÍTICO

Definição e execução de tools:

- [ ] Tool Definition (description, parameters)
- [ ] Zod Schemas for Validation
- [ ] Tool Execution Pattern
- [ ] Dynamic Tools
- [ ] Tool Results Handling

**Por que**: Implementar `CategorizeTool`, `RoutingTool`, etc com type-safety

---

#### 4. **[Structured Outputs](https://ai-sdk.dev/docs/structured-data)** ⭐⭐ IMPORTANTE

Validação estruturada de outputs:

- [ ] Output.text()
- [ ] Output.object()
- [ ] Output.array()
- [ ] Schema Validation with Zod
- [ ] Partial Streaming

**Por que**: Garantir respostas estruturadas e validadas

---

#### 5. **[Providers](https://ai-sdk.dev/docs/providers)** ⭐⭐ IMPORTANTE

Integração com múltiplos provedores:

- [ ] OpenAI (`@ai-sdk/openai`)
- [ ] Anthropic (`@ai-sdk/anthropic`)
- [ ] Google (`@ai-sdk/google`)
- [ ] Ollama (Local)
- [ ] Switching Between Providers (critério de seleção)

**Por que**: Suportar múltiplos provedores dinamicamente

---

#### 6. **[Embedding Models](https://ai-sdk.dev/docs/embeddings)** ⭐ IMPORTANTE

Geração de embeddings para RAG:

- [ ] Embedding API
- [ ] Using Different Providers
- [ ] Storage in Vector DB

**Por que**: Implementar `KnowledgeRetrieverTool` com pgvector

---

#### 7. **[Observability & DevTools](https://ai-sdk.dev/docs/devtools)** ⭐ IMPORTANTE

Rastreamento e debugging:

- [ ] Enabling DevTools
- [ ] Accessing Metrics
- [ ] Production Observability

**Por que**: Observabilidade integrada, LGPD compliance, debugging

---

### Documentação Complementar (Leitura Opcional)

- [ ] **Error Handling** - Tratamento de falhas
- [ ] **Streaming** - Real-time updates para frontend
- [ ] **Model Context Protocol** - Extensibilidade
- [ ] **Caching** - Otimização de chamadas (ai-sdk/cache)

---

## 🔧 Padrões de Implementação

### 1. Inicialização Dinâmica de Modelos

**Arquivo**: `src/services/llm/providers.ts`

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOllama } from "@ai-sdk/ollama";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export interface ModelConfig {
  provider: "openai" | "anthropic" | "ollama" | "google";
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
}

export async function initializeModel(
  config: ModelConfig,
): Promise<LanguageModel> {
  switch (config.provider) {
    case "openai":
      return createOpenAI({
        apiKey: config.apiKey,
      })(config.modelName);

    case "anthropic":
      return createAnthropic({
        apiKey: config.apiKey,
      })(config.modelName);

    case "ollama":
      return createOllama({
        baseUrl: config.baseUrl || "http://localhost:11434",
      })(config.modelName);

    case "google":
      return createGoogleGenerativeAI({
        apiKey: config.apiKey,
      })(config.modelName);

    default:
      throw new Error(`Provedor desconhecido: ${config.provider}`);
  }
}
```

---

### 2. Orquestração de Agentes Multi-Tenant

**Arquivo**: `src/agents/TenantAgentManager.ts`

```typescript
import { generateText, tool } from "ai";
import { z } from "zod";
import type { LanguageModel } from "ai";
import { initializeModel } from "../services/llm/providers";
import { getTenantConfig } from "../services/db/queries";
import { getTenantKnowledge } from "../services/vectorstore/search";
import { DataSanitizer } from "../services/privacy/sanitizer";

export class TenantAgentManager {
  private modelCache = new Map<string, LanguageModel>();
  private sanitizer: DataSanitizer;

  constructor() {
    this.sanitizer = new DataSanitizer();
  }

  /**
   * Obtém ou instancia modelo para um tenant
   */
  private async getModel(tenantId: string): Promise<LanguageModel> {
    if (this.modelCache.has(tenantId)) {
      return this.modelCache.get(tenantId)!;
    }

    const config = await getTenantConfig(tenantId);
    const model = await initializeModel(config.modelConfig);
    this.modelCache.set(tenantId, model);
    return model;
  }

  /**
   * Processa ticket com isolamento multi-tenant
   */
  async processTicket(
    tenantId: string,
    ticket: { id: string; description: string; customerFeedback?: string },
  ) {
    // 1. Sanitizar entrada (LGPD)
    const sanitized = this.sanitizer.sanitizeTicket(ticket);

    // 2. Recuperar conhecimento específico do tenant
    const tenantKnowledge = await getTenantKnowledge(
      tenantId,
      sanitized.description,
    );

    // 3. Obter modelo configurado para tenant
    const model = await this.getModel(tenantId);

    // 4. Executar agent com tools
    const response = await generateText({
      model,
      system: `Você é um agente de suporte para ${tenantId}.
      
BASE DE CONHECIMENTO:
${tenantKnowledge}

REGRAS:
- Categorize o ticket
- Analise satisfação
- Encaminhe para equipe correta
- NUNCA exponha dados pessoais`,

      prompt: sanitized.description,

      tools: {
        categorizeAndRoute: tool({
          description: "Categoriza ticket, define prioridade e equipe",
          parameters: z.object({
            category: z.string().describe("Categoria do ticket"),
            priority: z.enum(["low", "medium", "high", "critical"]),
            team: z.enum(["nivel1", "financeiro", "comercial"]),
            satisfactionScore: z.number().min(1).max(5),
          }),
          execute: async (args) => args,
        }),
      },
    });

    // 5. Armazenar resultado e aprender
    await this.storeAndLearn(tenantId, sanitized, response);

    return response;
  }

  private async storeAndLearn(tenantId: string, ticket: any, result: any) {
    // Implementar persistência e aprendizado
  }
}
```

---

### 3. Definição de Tools Type-Safe

**Arquivo**: `src/tools/categorize.ts`

```typescript
import { tool } from "ai";
import { z } from "zod";
import type { CoreTool } from "ai";

const categorizationSchema = z.object({
  category: z.string().describe("Categoria principal do ticket"),
  subcategory: z.string().optional().describe("Subcategoria"),
  confidence: z.number().min(0).max(1).describe("Confiança da categorização"),
  reasoning: z.string().describe("Motivo da categorização"),
});

export type CategorizationResult = z.infer<typeof categorizationSchema>;

export function createCategorizeTool(): CoreTool {
  return tool({
    description: `Categoriza um ticket de suporte em categorias predefinidas.
    Use este tool para classificar o tipo de problema do cliente.`,

    parameters: z.object({
      ticketDescription: z.string().describe("Descrição do ticket"),
      tenantId: z.string().describe("ID do tenant para contexto"),
    }),

    execute: async ({ ticketDescription, tenantId }) => {
      // Implementar lógica de categorização
      // Pode chamar DB para histórico de categorizações do tenant
      return {
        category: "Billing",
        subcategory: "Invoice Question",
        confidence: 0.95,
        reasoning: "Menção a 'fatura' e 'cobrança' detectada",
      };
    },
  });
}
```

---

### 4. Endpoints Hono Type-Safe

**Arquivo**: `src/api/handlers/processTicket.ts`

```typescript
import { Context } from "hono";
import { z } from "zod";
import { TenantAgentManager } from "../../agents/TenantAgentManager";

const ticketRequestSchema = z.object({
  id: z.string(),
  description: z.string(),
  customerFeedback: z.string().optional(),
});

export type TicketRequest = z.infer<typeof ticketRequestSchema>;

export async function processTicketHandler(c: Context) {
  try {
    const tenantId = c.req.param("tenantId");
    const body = await c.req.json();

    // Validação
    const ticket = ticketRequestSchema.parse(body);

    // Processa com agente
    const agentManager = new TenantAgentManager();
    const result = await agentManager.processTicket(tenantId, ticket);

    return c.json({
      ticketId: ticket.id,
      category: result.text, // Estruturado pela IA
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: "Processamento falhou" }, 500);
  }
}
```

---

### 5. Gerenciamento de Sessões e Contexto

**Arquivo**: `src/agents/SessionManager.ts`

```typescript
import { Message } from "ai";
import { getSessionHistory, saveMessage } from "../services/db/queries";

export class SessionManager {
  /**
   * Recupera histórico de conversa do tenant
   */
  async getSessionHistory(
    tenantId: string,
    sessionId: string,
  ): Promise<Message[]> {
    const messages = await getSessionHistory(tenantId, sessionId);
    return messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }

  /**
   * Adiciona nova mensagem à sessão
   */
  async addMessage(
    tenantId: string,
    sessionId: string,
    role: "user" | "assistant",
    content: string,
  ) {
    await saveMessage(tenantId, sessionId, role, content);
  }
}
```

---

## 📈 Estratégia de Escalabilidade

### Fase 1: MVP (Stateless Horizontal)

```
┌─────────────────┐
│  Load Balancer  │
├────────┬────────┤
│ Agent  │ Agent  │ (Stateless, múltiplas instâncias)
│Service │Service │
└────────┴────────┘
     ↓
┌──────────────────────┐
│   PostgreSQL (1)     │ (Compartilhado)
│   Redis (1)          │ (Compartilhado)
└──────────────────────┘
```

**Características**:

- Instâncias stateless do agente
- Compartilham BD e cache
- Escalável horizontalmente via Kubernetes

---

### Fase 2: Background Jobs

```
┌──────────────────────────────────────┐
│   API Services (Hono)                │
└──────────────────────────────────────┘
              ↓
         ┌─────────────┐
         │  Redis      │ (Job Queue)
         │  Queue      │
         └─────────────┘
              ↓
┌──────────────────────────────────────┐
│  BullMQ Workers                      │
│  - Embedding ingest                  │
│  - Pattern extraction                │
│  - Analytics aggregation             │
└──────────────────────────────────────┘
```

**Tecnologias**:

- `bullmq` para job queue
- Redis como broker
- Workers separados para processamento assíncrono

---

### Fase 3: Distributed Caching & Observability

```
┌──────────────────────────────────────┐
│   Distributed Tracing (Otel)         │
│   - OpenTelemetry                    │
│   - Jaeger/Datadog                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│   Vercel AI SDK DevTools             │
│   - Metrics collection               │
│   - Token counting                   │
│   - Tool call logging                │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│   Multi-region Redis Cache           │
│   - Session store                    │
│   - Hot data                         │
└──────────────────────────────────────┘
```

---

## 🔗 Integração com Outros Serviços

### Integração com TickZap API (Express)

**Fluxo de Integração**:

```
TickZap API (Express)
    ↓
[Webhook para Tickets]
    ↓
TickZap AI Service (Hono)
    ├─ Processa ticket
    ├─ Categoriza
    └─ Retorna estruturado
    ↓
TickZap API (Persiste resultado)
```

**Implementação**:

```typescript
// src/api/routes.ts
import { Hono } from "hono";

const app = new Hono();

// Endpoint para TickZap API
app.post("/:tenantId/process", async (c) => {
  const tenantId = c.req.param("tenantId");
  const webhook = await c.req.json();

  // Processa
  const result = await processTicket(tenantId, webhook);

  // Retorna estruturado para caller
  return c.json(result);
});
```

---

### Integração com WhatsApp Gateway

**Sem acoplamento**:

```
WhatsApp Gateway
    ↓
[POST /api/v1/{tenantId}/process]
    ↓
TenantAgentManager
    ↓
Result estruturado
    ↓
Gateway retorna para WhatsApp
```

**Vantagem**: Mesmo endpoint pode ser usado por SMS, Web, Mobile, etc

---

### Integração com Webhooks Genéricos

```typescript
// Webhook genérico que funciona com qualquer origem
app.post("/:tenantId/webhook", async (c) => {
  const source = c.req.header("x-source"); // whatsapp, web, sms, etc

  const ticket = {
    id: c.req.header("x-ticket-id"),
    description: await c.req.text(),
    source,
  };

  const result = await processTicket(tenantId, ticket);
  return c.json(result);
});
```

---

## 🚀 Roadmap de Implementação

### Sprint 1: Setup & Core (2 semanas)

- [ ] Inicializar projeto Bun + Hono
- [ ] Configurar TypeScript + Zod validation
- [ ] Setup PostgreSQL + Redis local
- [ ] Implementar `TenantAgentManager` básico
- [ ] Criar 2-3 tools simples
- [ ] Endpoints Hono básicos
- [ ] Testes unitários para tools

**Saída**: MVP processando tickets com 1 provedor

---

### Sprint 2: Multi-Provider & Observability (2 semanas)

- [ ] Suporte a múltiplos provedores (OpenAI, Anthropic, Ollama)
- [ ] Vercel AI DevTools integrado
- [ ] Estrutured outputs com Zod
- [ ] Session management com Redis
- [ ] Audit logs (LGPD)
- [ ] Tests de integração

**Saída**: Multi-tenant com múltiplos provedores

---

### Sprint 3: Knowledge Base & RAG (2 semanas)

- [ ] Setup pgvector no PostgreSQL
- [ ] Embedding pipeline
- [ ] `KnowledgeRetrieverTool` com busca vetorial
- [ ] Ingestão de documentos
- [ ] Analytics endpoint

**Saída**: Base de conhecimento ativa por tenant

---

### Sprint 4: Production Ready (2 semanas)

- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Load testing
- [ ] Security review
- [ ] Documentation
- [ ] Deployment

**Saída**: Production-ready em staging

---

## 📋 Checklist de Implementação

### Core Infrastructure

- [ ] Projeto Bun inicializado com TypeScript
- [ ] Hono app rodando localmente
- [ ] PostgreSQL + pgvector setup
- [ ] Redis setup
- [ ] Variáveis de ambiente validadas com Zod

### Agent & LLM

- [ ] TenantAgentManager implementado
- [ ] Multiple providers funcionando (openai, anthropic, ollama)
- [ ] Tool calling integrado
- [ ] Structured outputs validados
- [ ] Vercel AI DevTools ativo

### Tools Customizados

- [ ] CategorizeTool
- [ ] RoutingTool
- [ ] SatisfactionAnalyzerTool
- [ ] PatternExtractorTool
- [ ] KnowledgeRetrieverTool

### Data Layer

- [ ] Migrations SQL
- [ ] Chat history persistence
- [ ] Session management
- [ ] Vector embeddings storage
- [ ] Audit logs

### Privacy & Security

- [ ] DataSanitizer (remove PII)
- [ ] Encryption at rest
- [ ] Tenant isolation
- [ ] API key validation
- [ ] LGPD compliance

### API Endpoints

- [ ] POST /api/v1/:tenantId/process
- [ ] GET /api/v1/:tenantId/knowledge-base
- [ ] GET /api/v1/:tenantId/analytics
- [ ] POST /api/v1/:tenantId/feedback

### Testing & Monitoring

- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] DevTools metrics
- [ ] Structured logging
- [ ] Error tracking (Sentry)

### Deployment

- [ ] Docker setup
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Load balancer config
- [ ] Database backups

---

## 💡 Principais Diferenças vs Arquitetura Anterior

| Aspecto                | Python (Agno)             | TypeScript (Vercel AI SDK)    |
| ---------------------- | ------------------------- | ----------------------------- |
| **Framework**          | Agno (framework-specific) | Vercel AI SDK (agnóstico)     |
| **Type Safety**        | Dinâmico                  | Type-safe (TypeScript)        |
| **Multi-tenant**       | Manual                    | Nativo                        |
| **Provedores**         | Principalmente OpenAI     | 25+ provedores suportados     |
| **Observabilidade**    | Manual                    | DevTools built-in             |
| **Tool Calling**       | Via Agno                  | Via Vercel AI (standardizado) |
| **Message Management** | Customizado               | Estruturado (AI SDK)          |
| **Escalabilidade**     | Manual                    | Preparado para K8s            |
| **Reutilização**       | Acoplada a FastAPI        | Agnóstica (Hono adapter)      |

---

## 📚 Referências

### Documentação Oficial

- [Vercel AI SDK Docs](https://ai-sdk.dev/docs)
- [Hono Docs](https://hono.dev/)
- [Bun Runtime](https://bun.sh/)
- [pgvector](https://github.com/pgvector/pgvector)
- [Zod Validation](https://zod.dev/)

### Tecnologias Complementares

- BullMQ: Job queuing
- Redis: Caching & sessions
- PostgreSQL: Data persistence
- OpenTelemetry: Distributed tracing
- Docker: Containerization

---

## 🎯 Próximos Passos

1. **Aprovação da Arquitetura**: Validar com time
2. **Setup do Repositório**: Criar `tickzap-ai-sdk` baseado neste plano
3. **Sprint 1**: Iniciar implementação do MVP
4. **Iteração**: Feedback contínuo e refinamento

---

**Versão**: 1.0  
**Última atualização**: 2026-06-30  
**Status**: Pronto para Implementação
