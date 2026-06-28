# API Context — Liaison

> **Base URL:** `/api/v1/` (host = `LOCAL_IP` em dev, domínio em prod)
> **Protocol:** REST (Django REST Framework)
> **Last Updated:** 2026-06-28

---

## 1. Authentication

- **Method:** Bearer JWT (djangorestframework-simplejwt, HS256)
- **Header:** `Authorization: Bearer <access>`
- **Token endpoint:** `POST /api/v1/auth/login/`
- **Token expiry:** access 30min · refresh 1d
- **Refresh:** `POST /api/v1/auth/token/refresh/` (sem refresh automático no client)
- **Default DRF permission:** `IsAuthenticated` — endpoint público declara `AllowAny`.

---

## 2. Endpoints

### Auth & registro (`AllowAny`)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/login/` | Login (email **ou** CNPJ → JWT) | No |
| POST | `/auth/token/refresh/` | Refresh access token | No |
| POST | `/auth/register/student/` | Cria User estudante + StudentProfile | No |
| POST | `/auth/register/organization/` | Cria User org + OrganizationProfile (`status=pending`) | No |
| POST | `/auth/check-email/` | Unicidade de email | No |
| POST | `/auth/check-matricula/` | Unicidade de matrícula | No |
| GET | `/health/` | Healthcheck `{status: ok}` | No |

### Users
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/users/` | Lista usuários | IsAdmin |
| POST | `/users/` | Cria usuário | IsAdmin |
| GET | `/users/{uuid}/` | Detalhe | IsAdminOrSelf |
| PUT/PATCH | `/users/{uuid}/` | Atualiza | IsAdminOrSelf |
| DELETE | `/users/{uuid}/` | Remove | IsAdminOrSelf |

### Estudante — perfil próprio (`IsAuthenticated + IsEstudante`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/students/me/` | Perfil do estudante logado |
| PATCH | `/students/me/update/` | Atualiza perfil |
| POST | `/students/me/avatar/` | Upload avatar (multipart) |
| POST | `/students/me/banner/` | Upload banner (multipart) |
| POST | `/students/me/gallery/` | Adiciona foto à galeria |
| DELETE | `/students/me/gallery/{photo_id}/` | Remove foto |
| POST | `/students/me/change-password/` | Troca de senha |

### Organização — perfil próprio (`IsAuthenticated + IsOrganizacao`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/organizations/me/` | Perfil da org logada |
| PATCH | `/organizations/me/update/` | Atualiza perfil |
| POST | `/organizations/me/logo/` | Upload logo (multipart) |
| POST | `/organizations/me/banner/` | Upload banner (multipart) |
| POST | `/organizations/me/gallery/` | Adiciona foto à galeria |
| DELETE | `/organizations/me/gallery/{photo_id}/` | Remove foto |
| POST | `/organizations/me/change-password/` | Troca de senha |
| GET | `/organizations/me/opportunities/` | Vagas da org logada |

### Admin — moderação de orgs (`IsAdmin`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/organizations/` | Lista orgs |
| POST | `/admin/organizations/{uuid}/approve/` | Aprova (grava AdminActionLog) |
| POST | `/admin/organizations/{uuid}/reject/` | Reprova |
| POST | `/admin/organizations/{uuid}/request-info/` | Solicita informações |

### Vagas (`IsAuthenticated + IsOwnerOrReadOnly`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/opportunities/` | Lista (leitura aberta a autenticados) |
| POST | `/opportunities/` | Cria (org dona) |
| GET | `/opportunities/{uuid}/` | Detalhe — **`AllowAny`** (público). 404 p/ `draft`/inexistente; `active`/`paused`/`closed` retornam 200. Org expandida (`razao_social, nome_fantasia, logo, mission, areas_de_atuacao`) + `applicants_count` real + `already_applied` |
| PUT/PATCH | `/opportunities/{uuid}/` | Atualiza (só dona) |
| DELETE | `/opportunities/{uuid}/` | Remove (só dona) |

### Candidaturas (`IsAuthenticated`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/applications/` | `{ opportunity: uuid }` → 201. Só `estudante` (403 senão); 400 duplicata/vaga fechada |
| GET | `/applications/` | Lista candidaturas do estudante autenticado (`opportunity` resumida + `status` + `created_at`) |

---

## 3. Response Conventions

DRF padrão — serializer JSON direto (sem envelope `data`/`meta`). Listas retornam array (ou objeto paginado se paginação for ativada por view). Erros no formato DRF:

```json
{ "campo": ["mensagem de erro"], "detail": "..." }
```

---

## 4. Error Codes (status HTTP DRF)

| Status | When |
|--------|------|
| 400 | Validação de serializer / payload malformado |
| 401 | Token ausente/inválido/expirado |
| 403 | Permissão insuficiente (role errado, não-dono) |
| 404 | Recurso inexistente (ou ownership falhou em `get_object_or_404`) |
| 405 | Método não permitido |
| 415 | Upload sem `multipart/form-data` |

---

## 5. Pagination

- **Strategy:** N/A por padrão (DRF sem `DEFAULT_PAGINATION_CLASS` global). Listas retornam array completo. Adicionar paginação por view quando volume exigir.

---

## 6. Rate Limiting

- N/A (sem throttling configurado).

---

## 7. Notas

- Org loga com CNPJ: armazenado como dígitos puros — strip da máscara antes de validar/buscar.
- Uploads exigem `parser_classes=[MultiPartParser, FormParser]` e campo `image`.

---
*Generated by context-generator on 2026-06-28*
