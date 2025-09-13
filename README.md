# TickZap Project

Este é um projeto orquestrador que gerencia a integração entre o TickZap API e o TickZap Frontend utilizando Docker
Compose.

- Repositorio da API: https://github.com/RackSystems/tickzap-api
- Repositorio do Frontend: https://github.com/RackSystems/tickzap-frontend

## Visão Geral

O TickZap Project orquestra os seguintes componentes:

- **TickZap API**: Backend da aplicação
- **TickZap Frontend**: Interface de usuário
- **Banco de Dados**: PostgreSQL para armazenamento de dados

## Estrutura de Diretórios

Para começar a usar o TickZap, você precisa clonar este repositório e os repositórios relacionados dentro de uma pasta
chamada `tickzap-project`.

```
tickzap-project/
├── tickzap/            # Este repositório (orquestrador)
├── tickzap-api/        # Repositório da API
└── tickzap-frontend/   # Repositório do Frontend
```
