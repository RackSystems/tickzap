# tickzap frontend

Frontend em Vue 3 + TypeScript. Construído com Vite, Pinia, Vue Router, Tailwind CSS v4 e DaisyUI.

## Visão geral

- SPA usando Vue 3 (Composition API)
- Gerenciamento de estado com Pinia (+ persistência de estado)
- Roteamento no cliente com Vue Router
- Estilização via Tailwind CSS v4 e DaisyUI
- Build e servidor com Vite
- Cliente Axios com autenticação por cookies (`withCredentials`)

## Desenvolvimento local

Execute os comandos abaixo na raiz do repositório. Configure a API e inicie os serviços.

```sh
docker compose up -d --build
```

O frontend fica disponível em [localhost:5173](http://localhost:5173).
