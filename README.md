# Liaison

Plataforma que conecta estudantes universitários a organizações do terceiro setor para atividades de voluntariado — cobrindo a jornada completa de descoberta da vaga até a emissão de certificados digitais verificáveis.

> Projeto da disciplina REQ-T1, 2026.1 — UnB/FGA · Grupo Dona Izeti

---

## Pré-requisitos

| Ferramenta | Versão mínima | Necessário para |
|-----------|--------------|----------------|
| Docker | 24+ | Backend + Frontend |
| Docker Compose | 2.20+ | Backend + Frontend |
| Node.js | 20+ | Rodar frontend localmente (opcional) |

---

## Setup rápido — Tudo em containers

### 1. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env e defina SECRET_KEY com um valor seguro
```

### 2. Suba todos os containers

```bash
docker compose up
```

Na primeira execução, o build das imagens pode levar alguns minutos. Isso irá subir:

| Serviço | Container | Porta |
|---------|-----------|-------|
| PostgreSQL 16 | `liaison_db` | `5432` |
| Django + DRF | `liaison_backend` | `8000` |
| Expo (web) | `liaison_frontend` | `19006` |

### 3. Verifique os serviços

```bash
# Health check do backend
curl http://localhost:8000/api/v1/health/
# Esperado: {"status": "ok"}

# Frontend web
# Abra http://localhost:19006 no navegador
```

### 4. Crie o superusuário (para acessar o admin)

```bash
docker compose exec backend python manage.py createsuperuser
```

Acesse o Django admin em: **http://localhost:8000/admin/**

### 5. Teste o JWT

```bash
# Obtenha um token (substitua email/senha pelo usuário criado)
curl -X POST http://localhost:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "sua-senha"}'

# Resposta esperada:
# {"access": "<token>", "refresh": "<token>"}
```

---

## Setup alternativo — Frontend local (para mobile)

Se precisar rodar o frontend no emulador Android ou simulador iOS:

```bash
cd frontend
npm install
npx expo start
```

Opções disponíveis no terminal:
- Pressione `w` para abrir no navegador
- Pressione `a` para Android (emulador ou dispositivo)
- Pressione `i` para iOS (simulador macOS)

---

## Estrutura do projeto

```
.
├── backend/                    # Django + DRF (Python 3.12)
│   ├── config/                 # Settings, URLs, WSGI
│   ├── users/                  # App: modelo User customizado + auth
│   ├── opportunities/          # App: vagas de voluntariado (placeholder)
│   ├── applications/           # App: candidaturas (placeholder)
│   ├── certificates/           # App: certificados (placeholder)
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Expo + React Native (TypeScript)
│   ├── src/
│   │   ├── navigation/         # React Navigation (Root, Student, Org, Admin)
│   │   └── screens/            # Telas placeholder por fluxo
│   ├── App.tsx
│   └── Dockerfile
├── docker-compose.yml
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

## Rodando os testes

### Backend

```bash
docker compose exec backend pytest
# ou
cd backend && pytest
```

### Frontend

```bash
docker compose exec frontend npm test
# ou
cd frontend && npm test
```

---

## Comandos úteis

```bash
# Parar os containers
docker compose down

# Parar e remover volumes (reseta o banco)
docker compose down -v

# Ver logs do backend
docker compose logs -f backend

# Ver logs do frontend
docker compose logs -f frontend

# Acessar o shell Django
docker compose exec backend python manage.py shell

# Executar migrações manualmente
docker compose exec backend python manage.py migrate

# Rodar testes do backend
docker compose exec backend pytest

# Rodar testes do frontend (local ou no container)
docker compose exec frontend npm test
# ou cd frontend && npm test
```

---

## Documentação

A documentação do projeto está disponível em: [https://mdsreq-fga-unb.github.io/REQ-2026.1-T01-Liaison](https://mdsreq-fga-unb.github.io/REQ-2026.1-T01-Liaison)
