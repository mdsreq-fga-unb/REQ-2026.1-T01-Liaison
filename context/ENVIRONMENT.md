# Environment Variables — Liaison

> **Last Updated:** 2026-06-29
> Backend lê via `python-decouple` (`config(...)`) de `backend/.env`. Frontend só expõe vars com prefixo `EXPO_PUBLIC_`.

## Required (app won't start / quebra sem isso)

| Variable | Description |
|----------|-------------|
| `LOCAL_IP` | IP da rede local. Base p/ `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS`. Expo Go no celular alcança o backend por ele. Achar: `hostname -I` (Linux) / `ipconfig getifaddr en0` (macOS). |
| `DATABASE_URL` | Postgres. Ex: `postgres://postgres:postgres@localhost:5432/liaison`. |
| `EXPO_PUBLIC_API_BASE_URL` | (frontend) URL base da API. Sem ele o app não acha o backend. |

> Em prod com `USE_S3=True`, também são obrigatórios: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (sem default — quebram o boot se ausentes).

---

## Optional / Defaults

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `django-insecure-change-me-in-production` | Trocar em produção. |
| `DEBUG` | `True` | `False` em prod (desliga serve de media local). |
| `ALLOWED_HOSTS_EXTRA` | `""` (Csv) | Hosts extras além dos derivados de `LOCAL_IP`. |
| `CORS_ALLOWED_ORIGINS_EXTRA` | `""` (Csv) | Origens CORS extras. |
| `USE_S3` | `False` | `True` → storage S3 (django-storages + boto3). |
| `AWS_STORAGE_BUCKET_NAME` | `liaison-media-2026` | Bucket (só se `USE_S3`). |
| `CERT_VALIDATION_BASE_URL` | `http://localhost:8000/validar` | Base do QR/código do certificado → página pública `/validar/`. ⚠️ **Obrigatória em prod** com endereço alcançável pela internet (domínio estável, não IP que muda): o default `localhost` aponta pro aparelho de quem lê o QR (loopback) → **todo QR quebra** se subir sem trocar. URL congela no PDF **na emissão** — setar antes da 1ª emissão real; mudar não reescreve PDFs já emitidos. Trocou domínio? Redirect `301` do antigo. |

> Fixos no código (não-env): `AWS_S3_REGION_NAME="us-east-2"`, `AWS_S3_FILE_OVERWRITE=False`, `AWS_DEFAULT_ACL=None`, `AWS_QUERYSTRING_AUTH=False`. JWT: access 30min / refresh 1d / HS256. `MEDIA_URL=/media/`, `MEDIA_ROOT=backend/media`.

---

## .env file (backend)

```env
LOCAL_IP=<YOUR_LOCAL_IP>
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
DATABASE_URL=postgres://postgres:postgres@localhost:5432/liaison
# ALLOWED_HOSTS_EXTRA=staging.liaison.app
# CORS_ALLOWED_ORIGINS_EXTRA=https://admin.liaison.app
# --- prod / S3 ---
# USE_S3=True
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_STORAGE_BUCKET_NAME=liaison-media-2026
```

Frontend (`.env` ou `EXPO_PUBLIC_*` no ambiente):
```env
EXPO_PUBLIC_API_BASE_URL=http://<LOCAL_IP>:8000/api/v1
```

---

## Test environment

- Backend pytest usa DB Postgres real (`liaison_test`). Reset:
  ```bash
  docker compose exec db psql -U postgres -c "DROP DATABASE liaison_test; CREATE DATABASE liaison_test;"
  ```
- Nenhuma var de teste dedicada além de `DATABASE_URL` apontando p/ o Postgres local.

---

## Runtime / Internal

Derivados em `config/settings.py` (não setar à mão):

| Variable | Set by | Description |
|----------|--------|-------------|
| `ALLOWED_HOSTS` | settings | Montado de `LOCAL_IP` + `ALLOWED_HOSTS_EXTRA`. |
| `CORS_ALLOWED_ORIGINS` | settings | Montado de `LOCAL_IP` (+ `:8081` Metro) + `CORS_ALLOWED_ORIGINS_EXTRA`. |
| `STORAGES` | settings | Trocado para S3 só quando `USE_S3=True`. |
