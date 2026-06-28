# Plan — Módulo de Tickets (Chamados de Suporte)

## Contexto

O sistema possui dois conceitos distintos:

- **Conversation** — atendimento via chat (WhatsApp). Gerado automaticamente ao receber mensagem de um contato externo.
- **Ticket** — chamado de suporte aberto manualmente por um usuário logado (equipe de suporte), a partir de contato externo recebido por qualquer canal (telefone, e-mail, WhatsApp, presencial etc.).

---

## Regras de negócio

- Apenas usuários logados no sistema (equipe de suporte) podem abrir tickets.
- O **reporter** é o solicitante externo — pessoa ou empresa que entrou em contato. Não possui conta no sistema.
- O usuário que abre o chamado (`openedById`) pode ser diferente do agente que irá resolvê-lo (`assignedToId`).
- Futuramente, a IA poderá classificar o chamado (categoria, prioridade) e definir automaticamente o `assignedToId` com base nas regras de roteamento.

---

## Schema mínimo — `tickets`

| Campo | Tipo | Constraint | Observação |
|---|---|---|---|
| `id` | uuid | PK | |
| `subject` | text | NOT NULL | Título do chamado |
| `description` | text | nullable | Detalhamento |
| `status` | enum | NOT NULL, default `OPEN` | Ver enum abaixo |
| `priority` | enum | NOT NULL, default `MEDIUM` | Ver enum abaixo |
| `category` | text | nullable | Base do roteamento por IA |
| `source` | enum | nullable | Canal de origem do contato |
| `reporter` | json | NOT NULL | Dados do solicitante externo |
| `openedById` | uuid FK → user | NOT NULL | Usuário que registrou o chamado |
| `assignedToId` | uuid FK → user | nullable | Agente responsável (pode ser definido pela IA) |
| `createdAt` | timestamp | NOT NULL | |
| `updatedAt` | timestamp | NOT NULL | |

### Enums

```
status:   OPEN | IN_PROGRESS | PENDING | RESOLVED | CLOSED
priority: LOW | MEDIUM | HIGH | URGENT
source:   PHONE | EMAIL | WHATSAPP | IN_PERSON | OTHER
```

> `PENDING` indica aguardando retorno do solicitante — fluxo comum em suporte.

### Estrutura do campo `reporter` (JSON)

```json
{
  "name": "string (obrigatório)",
  "email": "string (opcional)",
  "phone": "string (opcional)",
  "company": "string (opcional)"
}
```

---

## Campos excluídos do MVP (ficam para depois)

| Campo | Motivo |
|---|---|
| `resolvedAt` / `closedAt` | Métricas de SLA — não bloqueiam o fluxo |
| `tags` | Classificação adicional por IA — segunda iteração |
| `conversationId` FK | Vínculo com atendimento WhatsApp — definir fluxo antes |
| `department` / `team` | Necessário apenas com múltiplas equipes |

---

## Integração futura com IA (roteamento/distribuição)

Os campos críticos para que a IA funcione:

- `priority` — lido e potencialmente setado pela IA com base no conteúdo
- `category` — classificado pela IA para decidir o destino do chamado
- `assignedToId` — campo onde a IA escreve a decisão de roteamento
- `source` — contexto adicional para a IA

---

## Pendências antes de implementar

- [ ] Definir se `category` será texto livre ou enum fixo
- [ ] Decidir se tickets podem ser vinculados a uma `conversation` existente (`conversationId` FK)
- [ ] Adicionar `ticket` e `ticketStatuses`/`ticketPriorities`/`ticketSources` em `enums.ts`
- [ ] Exportar `ticket` pelo `schema/index.ts`
- [ ] Criar relações em `relations.ts` (`openedBy`, `assignedTo`)
- [ ] Criar módulo `tickets/` (Controller, Service, Validator, routes)
- [ ] Registrar rota `/tickets` em `api.ts`
