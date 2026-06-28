# TickZap — Roadmap de Produto

> Service desk + atendimento de campo nascido dentro do WhatsApp, para empresas de serviço
> com carteira de clientes (assistência técnica, manutenção, provedores, TI local etc.).
> O cliente final não instala nada: manda mensagem no WhatsApp, o sistema reconhece o número,
> abre o ticket e conduz o fluxo. A IA atua em toda transição do fluxo — propõe, o humano aprova.

## Princípios

1. **WhatsApp é a porta de entrada, não "mais um canal".** O número do cliente é a autenticação.
2. **API-first.** Toda funcionalidade existe na REST API; o painel web é um cliente dela.
   Vender a API para integração vira opção futura sem pivô.
3. **IA propõe, humano aprova.** Triagem, resumos, respostas e conhecimento são sugeridos
   pela IA e confirmados por pessoas. Nada de bot aprendendo sozinho sem supervisão.
4. **ERP se integra, não se constrói.** Financeiro, NF e estoque ficam com Omie/Bling/Conta Azul
   via API. O TickZap é o sistema de registro do *atendimento*, não do dinheiro.
5. **Núcleo agnóstico, produto em módulos.** O core é canal + contato + conversa + IA;
   suporte/tickets, campo e (futuramente) leads são módulos em cima dele. O número conhecido
   identifica o cliente da carteira — número desconhecido é, por definição, um lead.

## Estado atual (jun/2026)

Já existe e funciona:

- Monorepo Bun: `apps/api` (Express + Prisma + PostgreSQL + Redis + BullMQ + WebSocket) e `apps/web` (Vue 3).
- Integração WhatsApp via Evolution API (webhook + envio + QR code de conexão).
- Modelos: `User`, `Channel`, `Contact`, `Conversation` (PENDING/OPEN/CLOSED, toggle de IA), `Message`, `Agent`.
- Auth (login/logout/me), CRUD de canais, contatos, conversas, mensagens e agentes.
- Chat de atendimento, dashboard básico e cadastro de agentes de IA no front.
- IA em repositório separado ([tickzap-ai](https://github.com/RackSystems/tickzap-ai)).

> **Renomeação (jun/2026):** o modelo `Ticket` foi renomeado para `Conversation` (atendimento via WhatsApp).
> O termo `Ticket` passa a designar o **chamado de suporte** — aberto manualmente por um usuário logado
> a partir de contato externo (telefone, e-mail, WhatsApp, presencial etc.). O solicitante externo é
> armazenado no campo `reporter` (JSON). Schema planejado em [plan.md](plan.md).

Lacunas estruturais conhecidas:

- **Sem multi-tenancy** — não há modelo de empresa/conta; hoje o sistema serve uma empresa só.
- `Ticket` (chamado de suporte) ainda não tem módulo implementado — schema planejado, ver [plan.md](plan.md).
- Atribuição existe no schema (`Conversation.userId`) mas não há fluxo/quadro de gestão.
- Migração em andamento de `app/controllers` para `modules/<domínio>` (`users`, `contacts`, `channels`, `agents`, `conversations` migrados; faltam `messages`, `webhooks`, `auth`). Backlog técnico em [BACKLOG.md](BACKLOG.md).

---

## Fase 0 — Fundação *(pré-requisito de tudo)*

Decisões e estruturas que ficam caras de mudar depois.

- [ ] **Multi-tenancy (decidido: SaaS multi-empresa)** — criar modelo `Company`/`Tenant`, vincular `User`, `Channel`, `Contact`, `Ticket`, `Agent` e demais entidades a ele, e escopar todas as queries por tenant desde o início.
- [ ] Implementar `Ticket` (chamado de suporte): prioridade, categoria, source, reporter, assignedTo. Schema detalhado em [plan.md](plan.md).
- [ ] Papéis de usuário (admin, atendente, técnico de campo).
- [ ] Continuar migração para `modules/<domínio>` conforme os domínios forem tocados.

## Fase 1 — Núcleo de atendimento *(primeira versão vendável)*

- [ ] Quadro kanban de tickets (colunas por etapa/fila, drag-and-drop).
- [ ] Fluxo de atribuição: designar atendente/técnico, fila de não atribuídos, reatribuição.
- [ ] Ciclo de vida completo do ticket: abertura automática via WhatsApp → triagem → andamento → resolução → encerramento com confirmação ao cliente.
- [ ] Cadastros completos de clientes (contatos) e funcionários com papéis.
- [ ] Histórico unificado por cliente (todos os tickets e conversas do número).

## Fase 2 — IA operacional: o copiloto do atendente

Princípio da fase: **a IA não é treinada — ela enxerga.** O que parece "treinamento" é contexto:
todo ticket chega ao atendente com histórico, recorrência e caminho sugerido já montados pela IA
a partir dos próprios dados da operação. O modelo não muda; o contexto é que enriquece.

- [ ] **Triagem automática**: classificar categoria, prioridade e urgência da mensagem de entrada.
- [ ] **Triagem cliente vs lead**: número desconhecido não vira ticket — vira conversa marcada como lead; a IA qualifica o básico (nome, o que procura) e entrega numa fila própria para um humano. Semente barata do futuro módulo de leads.
- [ ] **Briefing de contexto**: na abertura/atribuição, a IA monta a memória do cliente — tickets anteriores, o que já foi tentado, recorrência ("3º chamado do mês, mesmo sintoma") — e sugere o próximo passo ao atendente.
- [ ] **Resposta sugerida**: rascunho baseado no histórico do cliente e em como casos parecidos foram resolvidos; o atendente edita e envia.
- [ ] **Sugestão de atribuição**: baseada em categoria, carga e histórico do funcionário.
- [ ] Definir contrato de integração com o `tickzap-ai` para esses casos de uso.

## Fase 3 — Base de conhecimento e auto-resposta

Princípio da fase: a empresa nunca "gerencia uma base de conhecimento" — ela responde perguntas.
A base é alimentada pela entrevista de onboarding e pelo aprendizado contínuo, não por um menu de cadastro.

- [ ] **Entrevista de onboarding**: no cadastro da empresa, formulário de perguntas simples e diretas (serviços prestados, horários, formas de pagamento, área de atendimento, prazos, garantia, tom de voz). A IA processa as respostas e gera a base de conhecimento inicial + a persona do agente (os campos do modelo `Agent` — `communication_style`, `purpose`, `company_description` — já mapeiam pra isso). O formulário pode ser coletado já na Fase 0 (signup) e processado aqui.
- [ ] Auto-resposta nível 1: IA responde dúvidas cobertas pela base; fora da base, escala para humano.
- [ ] **Aprendizado com aprovação**: minerar conversas encerradas, detectar perguntas frequentes e respostas dos atendentes, e sugerir entradas — um clique para aprovar. Quando a IA não souber responder algo recorrente, ela mesma pergunta ao dono (a mesma mecânica da entrevista, agora contínua) e a resposta vira conhecimento. (Anonimizar dados pessoais antes de virar conhecimento — LGPD.)
- [ ] **Problemas conhecidos**: detectar padrões entre tickets de clientes diferentes (ex.: lote defeituoso — vários chamados com o mesmo sintoma em poucos dias). O cluster vira um "problema conhecido" com causa e caminho de resolução; novos tickets que casarem já chegam ao atendente com essa indicação e o gestor é alertado. Usa a mesma infraestrutura de busca semântica da base de conhecimento.
- [ ] **Skills da empresa (playbooks auto-redigidos)**: além de pergunta-e-resposta (conhecimento declarativo), a IA destila dos atendimentos resolvidos o *procedimento* — "como esta empresa trata troca por defeito", "como agendar visita de garantia" — e escreve documentos de skill que ela mesma revisita quando um ticket casa com o cenário, guiando o copiloto e a auto-resposta. Rascunho passa por aprovação do gestor; toda skill tem dono e data de revisão (procedimento envelhece — skill vencida deixa de ser usada até revalidar). Entrevista de onboarding e problemas conhecidos alimentam o mesmo formato.
- [ ] Gestão da base (editar/curar entradas, upload de documentos) como tela secundária de manutenção — não é o caminho principal de entrada de conhecimento.

## Fase 4 — Módulo de campo

- [ ] Agenda do técnico: visitas vinculadas a tickets, com data/janela e endereço (link para Waze/Maps; roteirização de verdade fica para depois).
- [ ] Check-in/check-out na visita.
- [ ] **Relatório por áudio/foto**: técnico manda áudio e fotos pelo próprio WhatsApp ao concluir e a IA redige o relatório de serviço para aprovação.

## Fase 5 — Gestão e SLA

- [ ] Contratos por cliente com SLA (tempo de primeira resposta, prazo de visita/resolução).
- [ ] Alertas antes do estouro de SLA e relatório mensal de cumprimento por cliente.
- [ ] Dashboards de rendimento: tickets por funcionário, tempo médio de resolução, visitas/dia, taxa de retrabalho — com leitura gerada por IA.

## Futuro / fora de escopo por enquanto

- Integração com ERPs (Omie, Bling, Conta Azul): ticket concluído → OS com valor → cobrança/NF no ERP.
- Peças/materiais por visita, faturamento recorrente de contrato, comissão de técnico.
- API pública documentada com chaves por empresa (já nasce pronta pelo princípio API-first).
- **Módulo de leads/vendas**: funil de oportunidades, kanban de vendas, campanhas — habilitável por empresa, sobre o mesmo núcleo de conversas. Só entra se a triagem cliente/lead da Fase 2 mostrar uso real (é briga com RD Station/Pipedrive — precisa de tração antes).
- Roteirização/otimização de agenda de campo.
- Outros canais de entrada (Instagram, Telegram, e-mail).

## Decisões em aberto

| Decisão | Contexto |
|---|---|
| Evolution API vs WhatsApp Cloud API oficial | Evolution (não oficial) tem risco de banimento de número; a oficial tem custo por conversa e exige aprovação Meta. Suportar ambas via abstração de `Channel`? |
| Modelo de cobrança | Por atendente? Por ticket? Por número conectado? Impacta o modelo de dados de tenant. |
| Escopo do `tickzap-ai` | O que roda no repo de IA vs o que é chamada direta de LLM na API principal. |
