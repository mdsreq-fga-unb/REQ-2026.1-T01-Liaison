# Architecture — Liaison

> **Last Updated:** 2026-06-28
> SaaS que conecta estudantes universitários a ONGs para voluntariado. API REST — Django backend + Expo (React Native) frontend, mobile-first.

## System Overview

```
┌─────────────────────────┐         HTTPS / JSON          ┌──────────────────────────┐
│  Expo / React Native     │  ── /api/v1/* ───────────────▶│  Django + DRF            │
│  (Metro, Expo Go)        │   Authorization: Bearer JWT    │  (gunicorn em prod)      │
│                          │◀───────────────────────────── │                          │
│  AuthContext + SecureStore│        201 / JSON / errors    │  ViewSets / APIViews     │
└─────────────────────────┘                                │  ┌────────────────────┐  │
                                                            │  │ Django ORM          │  │
                                                            │  └──────────┬─────────┘  │
                                                            └─────────────┼────────────┘
                                                                          ▼
                                                            ┌──────────────────────────┐
                                                            │  PostgreSQL 16            │
                                                            └──────────────────────────┘
   ImageField uploads ──▶  MEDIA_ROOT local (DEBUG)  /  S3 bucket (USE_S3=True, prod)
```

---

## Process Responsibilities

### Backend — Django
- **What it does:** serve a API REST `/api/v1/`, autenticação JWT, persistência via ORM, upload de imagens (local ou S3).
- **Entry point:** `backend/config/urls.py` (rotas), `backend/config/settings.py` (config). `manage.py` para comandos.
- **Boot:** lê `.env` via `python-decouple`. `ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS` montados dinamicamente de `LOCAL_IP`. Storage troca para S3 só se `USE_S3=True`.

### Frontend — Expo / React Native
- **What it does:** UI mobile-first; navegação por role; consome a API.
- **Entry point:** `frontend/App.tsx` → `AuthProvider` → `NavigationContainer` → `RootNavigator`.
- **Boot:** carrega tokens de `SecureStore` (persiste após reload). Fontes Google via `@expo-google-fonts`. `API_BASE_URL` de `EXPO_PUBLIC_API_BASE_URL`.

---

## Key Subsystems

### Auth (users app)
- **Responsibility:** registro (estudante/organização), login JWT, troca de senha, permissions por role.
- **Key files:** `users/views.py`, `users/serializers.py`, `users/permissions.py` (`IsAdmin`, `IsAdminOrSelf`, `IsEstudante`, `IsOrganizacao`), `config/urls.py`.
- **Protocol:** DRF default `IsAuthenticated`; endpoints públicos declaram `AllowAny` explícito.

### Perfis (users app)
- `StudentProfile` (1:1 User) + `StudentGalleryPhoto`. `OrganizationProfile` (1:1 User, status pending/approved/rejected) + `OrgGalleryPhoto`. Upload de avatar/logo/banner/gallery via `MultiPartParser`.

### Moderação de orgs (admin)
- `AdminOrganizationViewSet` (`IsAdmin`): list / approve / reject / request_info. Cada ação grava `AdminActionLog`.

### Vagas (opportunities app)
- `OpportunityViewSet` (`IsOwnerOrReadOnly`) CRUD + `OpportunityPhoto`. `MyOpportunitiesList` lista vagas da org logada.

### Placeholders
- `applications`, `certificates` — apps vazios, a implementar.

---

## Data Flows

### Registro de estudante → perfil
1. Frontend wizard 4 steps → `POST /api/v1/auth/register/student/` (`AllowAny`).
2. Serializer cria `User(role=estudante)` + `StudentProfile` atomicamente (`@transaction.atomic` no `save()`).
3. Frontend faz `POST /api/v1/auth/login/` → recebe access (30min) + refresh (1d).
4. Tokens em React state + `SecureStore`. Requests usam `authenticatedFetch` (header Bearer).

### Aprovação de organização (RF06)
1. Org registra → `status=pending`.
2. Admin: `GET /api/v1/admin/organizations/` → `POST .../{uuid}/approve/`.
3. View muda `status=approved` e grava `AdminActionLog`. Enforce no DRF, não só frontend.

### Upload de imagem
1. Frontend `FormData.append("image", {uri,name,type} as any)`.
2. `POST .../avatar/` (etc.) com `parser_classes=[MultiPartParser, FormParser]`.
3. Pillow valida; salva em `MEDIA_ROOT` (dev) ou S3 (prod). `DEBUG=True` serve media via `static()`.

---

## Auth Model

- **Tipo:** JWT HS256 (djangorestframework-simplejwt). Access 30min, refresh 1d, `ROTATE_REFRESH_TOKENS=False`.
- **Login field:** `USERNAME_FIELD="email"` (org loga com CNPJ → resolvido para email no `CustomTokenObtainPairView`).
- **Storage (client):** React state + `SecureStore`. **Sem refresh automático** — access expira em 30min.
- **Quem checa:** DRF permission classes por view. Default global `IsAuthenticated`.

---

## Key Conventions

- Prefixo de rota `/api/v1/`; paths em `kebab-case`.
- Endpoint público = `AllowAny` explícito (default é autenticado).
- Criação multi-objeto = `@transaction.atomic` no `save()` do serializer, não na view.
- Delete seguro = `get_object_or_404(Model, id=x, owner=profile)` (ownership na query, sem info leak).
- Imutabilidade planejada: `Attendance`/`Certificate` não editáveis pós-criação (RNF08).
