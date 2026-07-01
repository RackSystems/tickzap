# 🚀 Quick Start - TickZap AI Service com Vercel AI SDK

**Leia este arquivo primeiro** para entender rapidamente o projeto

---

## 📖 Documentos

1. **[TICKZAP_AI_ARCHITECTURE.md](./TICKZAP_AI_ARCHITECTURE.md)** ← DOCUMENTO PRINCIPAL
   - Arquitetura completa
   - Estrutura de diretórios
   - Padrões de implementação
   - Roadmap de 4 sprints

2. **[IMPLEMENTATION_PLAN_AI.md](./IMPLEMENTATION_PLAN_AI.md)** (referência anterior)
   - Visão geral original
   - Exemplos em Python/FastAPI

3. **[SEARCH_AI_FRAMEWORK.md](./SEARCH_AI_FRAMEWORK.md)** (referência anterior)
   - Pesquisa de frameworks IA
   - Comparativo LangChain vs Anthropic SDK

---

## 🎯 O Que Mudou

### Antes (Python + Agno)
```
FastAPI → Agno Framework → OpenAI API
❌ Framework-specific (Agno)
❌ Sem type-safety
❌ Multi-tenant manual
❌ Apenas OpenAI
```

### Depois (TypeScript + Vercel AI SDK)
```
Hono → Vercel AI SDK → 25+ Provedores
✅ Framework agnóstico
✅ Type-safe (TypeScript)
✅ Multi-tenant nativo
✅ OpenAI, Anthropic, Ollama, Google, etc
✅ DevTools integrado (observabilidade)
```

---

## 📚 Vercel AI SDK - Tópicos Essenciais

**Na ordem que você precisa ler:**

1. **[Core Concepts](https://ai-sdk.dev/docs/ai-sdk-core)** ← START HERE
   - Como inicializar um modelo
   - `generateText()` e `streamText()`
   - Message handling

2. **[Tool Calling](https://ai-sdk.dev/docs/tools/tool-calling)** ← CRÍTICO
   - Definir tools com Zod
   - Function calling automático
   - Tool execution pattern

3. **[Agents](https://ai-sdk.dev/docs/agents)** ← PADRÃO DE LOOPS
   - Multi-step execution
   - State management
   - Run/step pattern

4. **[Structured Outputs](https://ai-sdk.dev/docs/structured-data)** ← VALIDAÇÃO
   - Output.object(), Output.array()
   - Schema validation

5. **[Providers](https://ai-sdk.dev/docs/providers)** ← MÚLTIPLOS
   - OpenAI, Anthropic, Google, Ollama
   - Switching entre provedores

6. **[Observability](https://ai-sdk.dev/docs/devtools)** ← PRODUÇÃO
   - DevTools para debugging
   - Métricas e tracing

---

## 🏗️ Arquitetura em 60 Segundos

```
API Endpoint (Hono)
    ↓
TenantAgentManager (orquestração)
    ├─ Recupera config do tenant
    ├─ Obtém modelo (dinâmico: OpenAI/Anthropic/Ollama)
    └─ Executa agent com tools
    ↓
Vercel AI SDK
    ├─ generateText() com system prompt
    ├─ Tools: categorize, routing, satisfaction
    └─ Estrutured outputs com Zod
    ↓
Data Layer
    ├─ PostgreSQL: histórico, patterns
    ├─ pgvector: embeddings (RAG)
    ├─ Redis: cache sessões
    └─ Audit Logs: compliance LGPD
```

---

## 📂 Estrutura de Diretórios (resumida)

```
tickzap-ai-sdk/
├── src/
│   ├── api/                    # Endpoints Hono
│   ├── agents/                 # TenantAgentManager
│   ├── tools/                  # Tools customizados
│   ├── services/               # DB, Cache, LLM, Privacy
│   └── types/                  # TypeScript types
├── migrations/                 # SQL
└── docker/                     # Dockerfile + compose
```

**Detalhes**: veja `TICKZAP_AI_ARCHITECTURE.md` seção "Estrutura de Diretórios"

---

## 🔧 Padrões Principais

### 1. Inicializar Modelo Dinamicamente
```typescript
const model = await initializeModel({
  provider: config.provider, // openai | anthropic | ollama
  modelName: config.modelName,
  apiKey: config.apiKey,
});
```

### 2. Executar Agent com Tools
```typescript
const response = await generateText({
  model,
  prompt: ticket,
  tools: { 
    categorize: tool(...),
    routing: tool(...),
  }
});
```

### 3. Definir Tool com Zod
```typescript
const myTool = tool({
  description: "O que faz",
  parameters: z.object({
    input: z.string(),
  }),
  execute: async (args) => { /* lógica */ }
});
```

### 4. Multi-tenant Isolation
```typescript
async getModel(tenantId) {
  const config = await getTenantConfig(tenantId);
  return initializeModel(config.modelConfig);
}
```

---

## ✅ Checklist Antes de Começar

- [ ] Leu TICKZAP_AI_ARCHITECTURE.md (documento principal)
- [ ] Entende a estrutura de diretórios
- [ ] Estudou Vercel AI SDK Core Concepts
- [ ] Estudou Vercel AI SDK Tool Calling
- [ ] Entende pattern de TenantAgentManager
- [ ] Sabe como usar Zod para validação

---

## 🚀 Roadmap Rápido

| Sprint | Duração | Entregas |
|--------|---------|----------|
| 1 | 2 sem | MVP + 1 provedor (OpenAI) |
| 2 | 2 sem | Multi-provider + multi-tenant |
| 3 | 2 sem | RAG com pgvector |
| 4 | 2 sem | Production-ready (K8s) |

**Total**: 8 semanas para production

---

## 🔗 Links Importantes

### Documentação
- [Vercel AI SDK Docs](https://ai-sdk.dev/docs)
- [Hono Docs](https://hono.dev/)
- [Bun Runtime](https://bun.sh/)
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [Zod Docs](https://zod.dev/)

### Exemplos
- [Vercel AI Examples](https://github.com/vercel/ai/tree/main/examples)
- [Tool Calling Example](https://ai-sdk.dev/docs/tools/tool-calling)

### Ferramentas Complementares
- **Job Queue**: BullMQ (async processing)
- **Tracing**: OpenTelemetry
- **Logging**: Winston ou Pino
- **Testing**: Vitest

---

## 💡 Principais Decisões

### Por que Vercel AI SDK?
✅ Agnóstico (25+ provedores)  
✅ Tool calling built-in  
✅ DevTools para observabilidade  
✅ Type-safe com TypeScript  
✅ Comunidade grande  

### Por que Bun?
✅ 3-10x mais rápido que Node  
✅ Native TypeScript support  
✅ Melhor para microserviços  

### Por que pgvector + PostgreSQL?
✅ Sem infraestrutura extra  
✅ SQL puro para performance  
✅ Já existe no projeto  

---

## 🎓 Próxima Etapa

1. **Estude** [TICKZAP_AI_ARCHITECTURE.md](./TICKZAP_AI_ARCHITECTURE.md)
2. **Leia** documentação Vercel AI SDK (links acima)
3. **Discuta** arquitetura com o time
4. **Inicie** Sprint 1 (setup + MVP)

---

**Status**: Pronto para Implementação  
**Última atualização**: 2026-06-30
