# Watch Tasks — Desafio Fullstack

Gerenciamento de tarefas com login, categorias, colaboradores e relatório simples. Stack: Node (Express) rodando na AWS Lambda, PostgreSQL, OpenAPI/Swagger, Jest no back e Vue 3 + Vite + Tailwind no front.

## Links da entrega

- **Health check:** https://5v6yp86rk3.execute-api.us-east-2.amazonaws.com/dev/health — deve retornar `{"ok":true}`.
- *(A raiz `…/dev/` no browser dá "Cannot GET /"; é normal, não tem rota na `/`.)*
- **Swagger:** https://5v6yp86rk3.execute-api.us-east-2.amazonaws.com/dev/api/docs/ — use a barra no final. Em **Servers** seleciona a URL da AWS, faz login ou register, depois **Authorize** com `Bearer <token>` e testa o restante.
- **Base da API** (para variáveis como `VITE_API_URL`): `https://5v6yp86rk3.execute-api.us-east-2.amazonaws.com/dev` — sem barra no final.
- **Front (Vercel):** a adicionar quando estiver publicado.

Não há usuário de demo: crie uma conta pelo Swagger ou pela tela de registro. O `.env` com senhas e secrets não vai para o Git (`.gitignore`).

## Requisitos

- Node.js 20+
- Docker + Docker Compose se quiser Postgres local (veja abaixo)
- Conta AWS só se for fazer deploy serverless

## Estrutura de pastas

- `backend/` — API, SQL, `serverless.yml`, OpenAPI
- `frontend/` — Vue 3
- `docker-compose.yml` — Postgres 16 para desenvolvimento

Na raiz, `npm install` instala back e front (workspaces). Ou instale em cada pasta separadamente.

## Rodando localmente

### 1. Banco de dados

Na raiz:

```bash
docker compose up -d
```

Postgres em `localhost:5432`, usuário `postgres`, senha `postgres`, banco `watch_tasks` (detalhes no `docker-compose.yml`).

### 2. Backend

```bash
cd backend
npm install
npm run setup:env
```

Isso copia `.env.example` → `.env`; edite com sua `DATABASE_URL` e `JWT_SECRET`. Depois:

```bash
npm run migrate
npm run dev
```

API em http://localhost:3000

Variáveis úteis (veja também `.env.example`):

| Variável | Para quê |
|----------|----------|
| `DATABASE_URL` | Conexão com o Postgres |
| `JWT_SECRET` | Assinar tokens |
| `JWT_EXPIRES_IN` | Ex.: `7d` |
| `PORT` | Local, padrão `3000` |
| `PUBLIC_API_URL` | Opcional no deploy: ajuda o Swagger a mostrar a URL correta da API |

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # ou copy no Windows
npm install
npm run dev
```

Abre em http://localhost:5173. Em dev o Vite faz proxy de `/api` para o backend (`vite.config.js`).

Em produção o front precisa da variável `VITE_API_URL` com a URL pública da API (sem barra no final). O backend aceita CORS para o domínio do front (ex. Vercel).

## Vercel (front apontando para a AWS)

1. Push do repo para o GitHub sem commitar `backend/.env`.
2. Novo projeto na [Vercel](https://vercel.com) → importar o repo.
3. **Root directory:** `frontend`
4. Variável de ambiente: `VITE_API_URL` = base da API, ex. `https://5v6yp86rk3.execute-api.us-east-2.amazonaws.com/dev`
5. Deploy. O `frontend/vercel.json` evita 404 ao dar refresh em rotas como `/tasks`.

Se `VITE_API_URL` ficar vazio no build, o browser vai tentar `/api` no domínio da Vercel e não vai achar a API lá — por isso em produção essa variável é obrigatória.

## Swagger / OpenAPI

- Local: http://localhost:3000/api/docs
- Spec: `backend/openapi.yaml`

## Rotas (resumo)

Header nas rotas protegidas:

```http
Authorization: Bearer <token>
```

### Auth

- `POST /api/auth/register` — `email`, `password`, `name`
- `POST /api/auth/login` — `email`, `password` → `token` + `user`

### Categorias

- `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/:id`

### Tarefas

- `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/:id`
- `status`: `todo`, `in_progress`, `done`

### Colaboradores (só o dono)

- `GET /api/tasks/:id/collaborators`
- `POST /api/tasks/:id/collaborators` — corpo `{ "email": "..." }`
- `DELETE /api/tasks/:id/collaborators/:userId`

### Relatórios

- `GET /api/reports/summary`

### Health

- `GET /health` — sem autenticação

## Testes (backend)

```bash
cd backend
npm test
```

## Deploy na AWS (Serverless)

1. `aws configure` com credenciais válidas. O `serverless.yml` usa **us-east-2** por padrão.
2. No `backend/.env`: `DATABASE_URL`, `JWT_SECRET` e, se quiser o Swagger alinhado ao API Gateway, `PUBLIC_API_URL` com a URL que o `serverless deploy` mostra em `endpoints` (sem barra no final). Às vezes você faz um deploy, copia a URL, cola no `.env` e faz o deploy de novo.
3. Na pasta `backend`:

```bash
npm install
npx serverless deploy
```

A função roda com `serverless-http` em cima do Express; timeout e memória estão configurados para não cortar queries ao banco.

**502 no login ou em outras rotas:** quase sempre a Lambda não consegue se comunicar com o RDS. Se o Postgres estiver em uma VPC privada, a função precisa estar na mesma VPC (subnets + security group) e o RDS precisa aceitar tráfego na porta **5432** a partir do SG da Lambda. No meu caso isso já está configurado no `serverless.yml`; em outro ambiente você vai precisar ajustar os IDs no YAML.

### Simular Lambda localmente

```bash
cd backend
npm run offline
```

## Licença

Desafio técnico — uso conforme a entidade avaliadora.
