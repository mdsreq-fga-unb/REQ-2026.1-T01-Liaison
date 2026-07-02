# Liaison

Plataforma que conecta estudantes universitários a organizações do terceiro setor para atividades de voluntariado — cobrindo a jornada completa de descoberta da vaga até a emissão de certificados digitais verificáveis.

> Projeto da disciplina REQ-T1, 2026.1 — UnB/FGA · Grupo Dona Izeti

---

## 🚀 Acessar o app

**Liaison está em produção** como aplicativo web instalável (PWA) — abra no navegador do celular ou desktop e instale como um app de verdade.

🌐 **[liaison.gcsoftware.tech](https://liaison.gcsoftware.tech)**

📦 Prefere Android nativo? Baixe o **APK** na [última release](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/releases/latest) — os arquivos e o link ficam sempre na tag da release mais recente.

> As instruções abaixo são para **desenvolvimento local**. Para apenas usar o app, use os links acima.

---

## Pré-requisitos

| Ferramenta | Versão | Necessário para |
|-----------|--------|----------------|
| Docker | 24+ | Executar backend + banco em containers |
| Docker Compose | 2.20+ | Orquestrar `db` + `backend` |
| Node.js | `20.x` (LTS) | Frontend mobile (Expo) — **use `nvm` para gerenciar a versão** |
| nvm | latest | Gerenciar versão do Node.js (lê o `.nvmrc`) |
| Expo Go | latest | Testar o app no dispositivo físico (iOS/Android) |

> **Por que `nvm`?** O `frontend/.nvmrc` fixa a versão do Node em `20.x`. Com `nvm use`, todos do time rodam exatamente a mesma versão, eliminando inconsistências de ambiente no frontend.

---

## Arquitetura de desenvolvimento (mobile-first)

O projeto é **mobile-first**: o frontend roda localmente via Metro/Expo (não em Docker), e o backend fica em containers Docker.

```
┌──────────────────────────────┐   HTTP/JSON     ┌──────────────────────────┐
│  Expo Go (iOS / Android)     │ ───────────────▶ │  Docker: Django + DRF    │
│  Metro rodando no host       │  192.168.x.x:8000│  (liaison_backend)       │
├──────────────────────────────┤                  └──────────────────────────┘
│  Admin web (navegador)       │   HTTP/JSON                │
│  Expo web / Django Admin     │ ───────────────▶  ┌────────▼──────────────┐
└──────────────────────────────┘                    │  Docker: PostgreSQL 16 │
                                                    │  (liaison_db)          │
                                                    └───────────────────────┘
```

| | Mobile (Estudantes / ONGs) | Admin (Gestão) |
|---|---|---|
| **Desenvolvimento** | Expo Go via Metro local | Django Admin (`/admin/`) no backend Docker + Expo web (`w`) |
| **Produção** | APK (Android) / IPA (iOS) | Django Admin (`/admin/`) — já incluso no backend |
| **Docker** | Não | Não (o Django Admin roda DENTRO do container `backend`) |

---

## Primeira vez? Setup único

Da raiz do projeto, execute **uma única vez**:

```bash
# 1. Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite .env:
#   - LOCAL_IP: troque pelo IP da sua máquina na rede local
#   - SECRET_KEY: defina um valor seguro

# 2. Suba o backend + banco pela primeira vez (pode levar minutos)
docker compose up -d db backend

# 3. Crie o superusuário (admin)
docker compose exec backend python manage.py createsuperuser

# 4. Instale as dependências do frontend
cd frontend
nvm use                    # ativa Node 20 (lê o .nvmrc)
npm ci --legacy-peer-deps  # instala dependências de forma determinística
```

Após esses 4 passos, o projeto está pronto para desenvolvimento.

---

## Fluxo diário — como rodar o projeto

### 1. Backend (Docker)

```bash
# Da raiz do projeto
docker compose up db backend
```

| Serviço | Container | Porta | Acesso |
|---------|-----------|-------|--------|
| PostgreSQL 16 | `liaison_db` | `5432` | — |
| Django + DRF | `liaison_backend` | `8000` | `http://localhost:8000` |
| Django Admin | (dentro do backend) | `8000` | `http://localhost:8000/admin/` |

**Verifique se está funcionando:**

```bash
curl http://localhost:8000/api/v1/health/
# Esperado: {"status": "ok"}
```

> Se quiser rodar em background: `docker compose up -d db backend`

---

### 2. Frontend mobile (Expo Go)

```bash
cd frontend
nvm use                    # ativa Node 20
npm ci --legacy-peer-deps  # garante dependências consistentes (só na 1ª vez do dia)
npx expo start --clear
```

> **Sempre use `--clear`** ao reiniciar o Metro após mudanças de dependências ou config — evita bundles cacheados.

**Conectando o app ao backend (dispositivo físico):**

O dispositivo físico (Expo Go) precisa alcançar o backend via IP da rede local — `localhost` não funciona de fora da máquina. Use o mesmo IP que você configurou como `LOCAL_IP` no `.env` da raiz.

```bash
# Copie o template e edite com seu IP
cp frontend/.env.local.example frontend/.env.local
# Edite frontend/.env.local: troque o IP pelo mesmo LOCAL_IP do .env raiz
```

> Se estiver usando apenas emulador ou navegador (`w`), pode pular este passo — o default `localhost` já funciona.

**Opções no terminal do Metro:**

| Tecla | Ação |
|-------|------|
| Escaneie o QR code | Abrir no dispositivo físico com Expo Go |
| `a` | Android (emulador instalado) |
| `i` | iOS (simulador — macOS apenas) |
| `w` | Abrir no navegador (web — útil para debug e admin) |

> **Atenção:** O backend precisa estar rodando (`docker compose up db backend`) antes de usar o app.

---

### 3. Admin web (gestão de organizações, usuários, etc.)

O módulo admin **não precisa de Docker separado** nem de APK — ele é web.

**Opção A — Django Admin (MVP):**

Acesse no navegador: **`http://localhost:8000/admin/`** e faça login com o superusuário criado no setup.

O Django Admin já cobre: aprovar/rejeitar organizações, gerenciar usuários, visualizar dados.

**Opção B — Admin customizado via Expo web (futuro):**

Com o Metro rodando (`npx expo start`), pressione `w` no terminal. O Expo serve o app no navegador. Usuários com role `admin` acessam as telas de gestão.

---

## Rodando os testes

### Backend

```bash
# Com Docker (recomendado — garante PostgreSQL disponível)
docker compose up -d db
docker compose exec backend pytest

# Com coverage
docker compose exec backend sh -c "pip install pytest-cov && pytest --cov=. --cov-report=term-missing"
```

### Frontend

```bash
cd frontend
nvm use
npm ci --legacy-peer-deps
npm test
```

### Frontend — type-check

```bash
cd frontend
npm run type-check
```

---

## Lint e formatação

```bash
# Backend
cd backend
ruff check .           # lint
ruff format . && isort .  # formatação

# Frontend
cd frontend
npm run lint           # lint
```

---

## Estrutura do projeto

```
.
├── backend/                    # Django + DRF (Python 3.12)
│   ├── Dockerfile
│   ├── config/                 # Settings, URLs, WSGI
│   ├── users/                  # App: modelo User customizado + auth
│   ├── opportunities/          # App: vagas de voluntariado (placeholder)
│   ├── applications/           # App: candidaturas (placeholder)
│   ├── certificates/           # App: certificados (placeholder)
│   ├── manage.py
│   └── requirements.txt
├── frontend/                   # Expo + React Native (TypeScript)
│   ├── .nvmrc                  # Trava Node.js na versão 20
│   ├── src/
│   │   ├── config/             # Configurações (API URL, etc.)
│   │   ├── navigation/         # React Navigation (Root, Student, Org, Admin)
│   │   └── screens/            # Telas placeholder por fluxo
│   ├── package.json            # Contém `engines` → node >=20, npm >=10
│   ├── package-lock.json       # Lockfile — fonte da verdade para deps
│   └── App.tsx
├── docker-compose.yml          # Apenas: db + backend (frontend roda local)
├── .dockerignore
├── .env.example
└── README.md
```

---

## Endpoints disponíveis

| Método | URL | Descrição | Auth |
|--------|-----|-----------|------|
| `GET` | `/api/v1/health/` | Health check | ❌ |
| `POST` | `/api/v1/auth/token/` | Obter JWT (access + refresh) | ❌ |
| `POST` | `/api/v1/auth/token/refresh/` | Renovar access token | ❌ |
| `GET` | `/admin/` | Django Admin | ✅ (session) |

---

## Comandos úteis

```bash
# ===== Docker (backend) =====
docker compose up db backend          # subir backend + banco
docker compose up -d db backend       # subir em background
docker compose down                   # parar containers
docker compose down -v                # parar e resetar banco (remove volumes)
docker compose logs -f backend        # ver logs do backend em tempo real
docker compose exec backend python manage.py shell        # shell Django
docker compose exec backend python manage.py migrate      # rodar migrações
docker compose exec backend python manage.py createsuperuser  # novo admin

# ===== Frontend =====
cd frontend && nvm use                # ativar Node 20 (.nvmrc)
cd frontend && npm ci --legacy-peer-deps  # instalar deps (determinístico)
cd frontend && npx expo start --clear     # iniciar Metro
cd frontend && npm test                    # rodar testes
cd frontend && npm run type-check          # type-check TypeScript

# ===== Git =====
# Convenção de commits: feat:, fix:, chore:, docs:, test:, refactor:
# Branches: <type>/<id>-<short-desc> — ex: feat/12-cadastro-estudantes
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `nvm use` não funciona | Instale o nvm: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash` |
| `npm ci` quebra com erro de peer deps | Rode `npm ci --legacy-peer-deps` (já documentado nos comandos) |
| Expo Go não conecta no backend | Verifique: (1) backend está rodando? (2) `.env.local` tem o IP correto? (3) IP da sua máquina não mudou? |
| `java.lang.String cannot be cast to java.lang.Boolean` (Android) | Rode `npm ci --legacy-peer-deps` — seu `node_modules` pode ter versões erradas de libs nativas |
| Docker "port already in use" | Porta 5432 ou 8000 já em uso. Pare o que estiver usando (`lsof -i :5432`) ou mude a porta no `docker-compose.yml` |
| Metro serve bundle cacheado após mudar deps | Sempre use `--clear`: `npx expo start --clear` |

---

## Documentação

A documentação completa do projeto está disponível em: [https://mdsreq-fga-unb.github.io/REQ-2026.1-T01-Liaison](https://mdsreq-fga-unb.github.io/REQ-2026.1-T01-Liaison)

Contexto técnico: [`CLAUDE.md`](./CLAUDE.md) (índice). Decisões de arquitetura: [`context/DECISIONS.md`](./context/DECISIONS.md) · Gotchas: [`context/GOTCHAS.md`](./context/GOTCHAS.md)
