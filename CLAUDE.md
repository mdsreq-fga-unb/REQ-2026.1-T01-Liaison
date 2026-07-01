# CLAUDE.md — Liaison

> SaaS que conecta estudantes universitários a ONGs para voluntariado (descoberta da vaga → certificado digital verificável). Resolve a obrigatoriedade de horas de extensão (CNE/CES 7/2018). Mantido pelo Grupo Dona Izeti (UnB/FGA).
> Arquitetura: API REST — Django backend + Expo (React Native) frontend, mobile-first.

## Como usar este contexto

- Leia **este arquivo** sempre. Para detalhe, abra o arquivo especializado da área que você vai tocar (índice no fim).
- **Workflow lean**: Opus orquestra inline — lê código, implementa, corrige na thread principal. Agentes só para isolamento real ou paralelismo.
- **Agents** (`.claude/agents/`): `@product-manager`, `@tech-lead`, `@designer`, `@context-generator`, `@committer`.
- **Skills**: comandos em `.claude/commands/` (`/plan`, `/implement`, `/hotfix-mode`, `/product-manager`, `/tech-lead`, `/designer`, `/committer`, `/context-generator`) + skills em `.claude/skills/` (`/test-runner`, `/security-checker`, `/test-generator`, `/commit-changes`, `/create-pr`, `/pr-description`, `/push-changes`, `/frontend-design`, `/html-to-figma`, `/figma-implement-design`, `/feature-requirement`, `/lessons-writer`).
- **Task files** em `.claude/work/tasks/<name>.md` — fonte da verdade por item de trabalho. Docs/specs em `.claude/work/docs/`, logs em `.claude/work/logs/`.

## Fluxo padrão

```
Opus direto → /plan (cria task file, PARA p/ aprovação) → implementa inline
    → /test-runner (só arquivos tocados) → review inline → @committer (commit + PR)
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React Native 0.81.5 + Expo SDK 54, TypeScript 5.9. Navegação `@react-navigation` v7 (native-stack + bottom-tabs). |
| Estilo | `StyleSheet` nativo + tokens em `src/theme/` — **sem NativeWind**. Ionicons + 29 SVGs custom (`react-native-svg-transformer`). |
| Backend | Python 3.12 + Django 5.0 + DRF 3.15. Auth JWT (simplejwt). PostgreSQL 16. Django ORM. Storage local ou S3 (`USE_S3`). |
| Lint/format | Backend: ruff + isort. Frontend: ESLint/Prettier **não configurados**. |
| Ambiente | Docker Compose (db + backend). Frontend roda local via Metro (não containerizado). |

## Dev commands

```bash
docker compose up db backend          # backend + DB
cd frontend && npx expo start         # Metro / Expo Go
cd backend && pytest                  # testes backend (pytest-django, DB real)
cd backend && pytest users/tests/test_x.py::TestClass::test_y   # teste único
cd frontend && npm test               # testes frontend (jest-expo + RNTL)
cd frontend && npm test -- Foo.test   # teste único (match por nome de arquivo)
cd backend && ruff check . && ruff format . && isort .
cd frontend && npx tsc --noEmit       # type-check
# Reset test DB:
docker compose exec db psql -U postgres -c "DROP DATABASE liaison_test; CREATE DATABASE liaison_test;"
```

## Convenções

- Python `snake_case` / classes `PascalCase`; JS `camelCase` / componentes+tipos `PascalCase`.
- Arquivos: backend `snake_case`; frontend componentes `PascalCase.tsx`, pastas de tela `kebab-case`.
- Código em inglês; português só em comentários e mensagens de usuário.
- Conventional Commits. Branch `<type>/<id>-<desc>`. API paths em `kebab-case`, sob `/api/v1/`.
- Endpoint público = `AllowAny` explícito (DRF default é `IsAuthenticated`).
- Criação multi-objeto = `@transaction.atomic` no `save()` do serializer. Delete seguro = `get_object_or_404(Model, id=x, owner=profile)`.

## Testing

Backend pytest + pytest-django (`<app>/tests/`, DB real Postgres). Frontend Jest `jest-expo` + RNTL 13, `*.test.tsx` co-localizado. **Sem E2E.** Coverage aspiracional 80% back / 70% front, sem tool configurado (`pytest-cov` ausente). **Testes não rodam no CI** (CI só faz deploy MkDocs) — rodar localmente antes do PR.

## Segurança

JWT HS256, 3 roles (estudante/organizacao/admin), access 30min / refresh 1d, **sem refresh automático**. `USERNAME_FIELD="email"`. Permissions custom em `users/permissions.py` (`IsAdmin`, `IsAdminOrSelf`, `IsEstudante`, `IsOrganizacao`). Orgs `status=pending` até aprovação admin — enforce no DRF, não só frontend (RF06). `Attendance`/`Certificate` imutáveis pós-criação (RNF08, planejado). Secrets via `.env` (não versionado) + GitHub Secrets.

## Estado dos apps

`users` ✅ (User UUID PK, profiles, galerias, moderação) · `opportunities` ✅ (Opportunity + fotos) · `applications`/`certificates` ⏳ placeholders.
**Gaps:** sem refresh de token · apps core de candidatura/certificado não iniciados · ESLint/Prettier ausentes · CI não roda testes.

## Context Files (detalhe por área)

| File | Quando ler |
|------|-----------|
| `context/ARCH.md` | Arquitetura, subsistemas, data flows, auth model |
| `context/FOLDER_ARCH.md` | Onde criar arquivos novos (rotas, telas, apps) |
| `context/API.md` | Endpoints REST `/api/v1/` + permissions |
| `context/DATA_MODEL.md` | Schema Postgres, entidades, relações |
| `context/DESIGN.md` | Tokens, tipografia, Figma `f6bQuVohTvZLF5WWPEbNob` |
| `context/DECISIONS.md` | ADRs (UUID/email, profiles, JWT, moderação, S3, StyleSheet) |
| `context/GOTCHAS.md` | Pitfalls backend/frontend/testing/infra — ler antes de implementar |
| `context/ENVIRONMENT.md` | Variáveis de ambiente (backend decouple + `EXPO_PUBLIC_`) |
| `context/INFRA.md` | Infra/deploy |
| `context/TESTING-POLICY.md` | O que testar vs não testar (triage risk-based) — ler antes de gerar testes |

Atualizar: `/context-generator --update`.
