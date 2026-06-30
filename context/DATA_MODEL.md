# Data Model — Liaison

> **Database:** PostgreSQL 16
> **ORM:** Django ORM
> **Schema files:** `backend/<app>/models.py` + `backend/<app>/migrations/`
> **Last Updated:** 2026-06-28

---

## 1. Entity Overview

`User` (UUID PK, AbstractUser, login por email) tem 1:1 com `StudentProfile` **ou** `OrganizationProfile` conforme `role`. Cada perfil tem galeria de fotos (1:N). `OrganizationProfile` passa por moderação admin (`status` + `AdminActionLog`). `OrganizationProfile` publica `Opportunity` (1:N), cada vaga com fotos (1:N). `StudentProfile` candidata-se a `Opportunity` via `Application` (1:N, `unique_together`). `Application` aprovada+concluída gera `Certificate` (1:1, write-once, PDF + QR de validação).

---

## 2. Entities

### User
**Table:** `users_user` (extends `AbstractUser`)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK, default uuid4 | Primary key |
| `email` | `email` | UNIQUE, `USERNAME_FIELD` | Login |
| `nome` | `varchar(120)` | | Nome |
| `role` | `varchar(20)` | choices: estudante/organizacao/admin, default estudante | Papel |

> `REQUIRED_FIELDS = ["username"]`. Campos `matricula`/`cnpj`/`endereco`/`telefone` foram **removidos** do User → migrados para os profiles.

### StudentProfile
**Table:** `users_studentprofile`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user` | `OneToOne(User)` | CASCADE, `related_name=student_profile` | Dono |
| `universidade` / `curso` | `varchar(200)` | | |
| `matricula` | `varchar(50)` | UNIQUE | |
| `semestre_atual` / `ano_conclusao` / `horas_extensao_exigidas` | `smallint` | null | |
| `turno` | `varchar(20)` | choices matutino/vespertino/noturno/integral, null | |
| `interesses` | `jsonb` | default list | |
| `avatar` / `banner` | `image` | null | upload_to avatars/, banners/ |
| `bio` | `text` | max 500 | |
| `created_at` / `updated_at` | `timestamp` | auto | |

### StudentGalleryPhoto
**Table:** `users_studentgalleryphoto`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `student_profile` | `FK(StudentProfile)` | CASCADE, `related_name=gallery_photos` |
| `image` | `image` | upload_to gallery/ |
| `created_at` | `timestamp` | auto · `ordering=[-created_at]` |

### OrganizationProfile
**Table:** `users_organizationprofile`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user` | `OneToOne(User)` | CASCADE, `related_name=organization_profile` | Dono |
| `cnpj` | `varchar(18)` | UNIQUE, `validar_cnpj` | Dígitos puros |
| `razao_social` | `varchar(200)` | | |
| `nome_fantasia` | `varchar(200)` | blank | |
| `telefone` | `varchar(20)` | | |
| `nome_responsavel` | `varchar(150)` | | |
| `status` | `varchar(20)` | choices pending/approved/rejected, default pending | Moderação (RF06) |
| `logo` / `banner` | `image` | null | org_logos/, org_banners/ |
| `mission` | `text` | max 300 | |
| `full_description` | `text` | max 2000 | |
| `areas_de_atuacao` | `jsonb` | default list | |
| `site` | `url` | blank | |
| `endereco` | `text` | max 300 | |
| `created_at` / `updated_at` | `timestamp` | auto | |

### OrgGalleryPhoto
**Table:** `users_orggalleryphoto` — espelha StudentGalleryPhoto (FK → OrganizationProfile, `related_name=gallery_photos`, upload_to `org_gallery/`).

### AdminActionLog
**Table:** `users_adminactionlog`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `uuid` | PK |
| `admin` | `FK(User)` | CASCADE, `related_name=admin_actions` |
| `organization` | `FK(OrganizationProfile)` | CASCADE, `related_name=admin_logs` |
| `action` | `varchar(30)` | choices approve/reject/request_info |
| `details` | `text` | blank |
| `created_at` | `timestamp` | default now |

### Opportunity
**Table:** `opportunities_opportunity`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK | |
| `organization` | `FK(OrganizationProfile)` | CASCADE, `related_name=opportunities` | Dona |
| `title` | `varchar(200)` | | |
| `area` | `varchar(50)` | choices (educacao…esporte) | |
| `description` | `text` | max 1000 | |
| `workload_value` | `positive int` | | |
| `workload_unit` | `varchar(50)` | | |
| `vacancies` | `positive int` | | |
| `modality` | `varchar(20)` | presencial/remoto/hibrido | |
| `location` | `varchar(255)` | blank | |
| `start_date` / `start_time` | `date` / `time` | | |
| `end_date` | `date` | null | |
| `is_recurring` | `bool` | default false | |
| `session_duration` | `duration` | null | |
| `schedule` | `jsonb` | default list | |
| `requirements` | `jsonb` | default list | |
| `accepts_any_course` | `bool` | default true | |
| `preferred_courses` | `jsonb` | default list | |
| `status` | `varchar(20)` | draft/active/paused/closed, default draft | |
| `created_at` / `updated_at` | `timestamp` | auto | |

### OpportunityPhoto
**Table:** `opportunities_opportunityphoto` — `FK(Opportunity)` CASCADE `related_name=photos`, `image` upload_to `opportunities/photos/`.

### Application
**Table:** `applications_application` — `id` UUID PK. `FK(StudentProfile)` CASCADE `related_name=applications`, `FK(Opportunity)` CASCADE `related_name=applications`. `status` choices `pending`/`approved`/`rejected`/`cancelled`/`completed` (default `pending`). Frequência (RF14/#27): `attendance` choices `present`/`partial`/`absent` (null até concluir), `hours_completed` (PositiveInt null), `completed_at` (DateTime null) — preenchidos via `complete` na conclusão (`absent` força `hours_completed=0`). `created_at`/`updated_at` auto. **`unique_together(student, opportunity)`** impede candidatura duplicada. `ordering=["-created_at"]`.

### Certificate
**Table:** `certificates_certificate` — `id` UUID PK. `OneToOne(Application)` **PROTECT** `related_name=certificate` (1 cert por application → 1 por student/opportunity). `hours` PositiveInt (snapshot da carga atestada). `pdf_file` FileField `upload_to=certificates/` (local ou S3). `validation_uuid` UUID unique (código público de validação, #30). `issued_at` auto. `revoked_at` DateTime null (revogação futura). **Write-once (RNF08):** `save()` em objeto persistido só aceita `update_fields ⊆ {pdf_file, revoked_at}`; qualquer outro update levanta `ValidationError`. student/opportunity/org acessados via `cert.application.*`. `ordering=["-issued_at"]`.

### Planejado (placeholders)
`Attendance` — sem tabela separada: frequência virou estado de `Application` (campos `status=completed`/`attendance`/`hours_completed`/`completed_at`). O tipo de frequência (presente/parcial/ausente) é o campo `attendance`.

---

## 3. Relationships Summary

| From | Type | To | Via |
|------|------|----|-----|
| StudentProfile | 1:1 | User | `user` |
| OrganizationProfile | 1:1 | User | `user` |
| StudentGalleryPhoto | N:1 | StudentProfile | `student_profile` |
| OrgGalleryPhoto | N:1 | OrganizationProfile | `organization_profile` |
| AdminActionLog | N:1 | User (admin) + OrganizationProfile | `admin`, `organization` |
| Opportunity | N:1 | OrganizationProfile | `organization` |
| OpportunityPhoto | N:1 | Opportunity | `opportunity` |

---

## 4. Soft Deletes

- **Strategy:** Hard delete (CASCADE). Sem `deleted_at`. Imutabilidade de `Attendance`/`Certificate` será no save/serializer, não soft-delete.

---

## 5. Migration Notes

- **Tool:** Django migrations (`makemigrations` / `migrate`).
- **Conventions:** prefixos lineares únicos (0001→0002…). Migration aplicada **não re-executa** ao editar model → drop/recreate do DB de teste. Remover campo = atualizar model + serializer (`Meta.fields`) + tests + `grep` no codebase inteiro (inclui interfaces TS do frontend — DRF ignora campo extra silenciosamente).
- **Multi-tenancy:** nenhuma (sem tenant_id).

---
*Generated by context-generator on 2026-06-28*
