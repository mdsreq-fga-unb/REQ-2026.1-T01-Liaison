# Desenvolvimento Remoto — VPS + Tailscale + Worktrees

Guia para rodar o projeto quando o ambiente é uma **VPS remota acessada via Tailscale**.

---

## Contexto

O projeto roda em uma VPS compartilhada. O browser do desenvolvedor acessa a VPS pelo **IP Tailscale**, não por `localhost`. Isso afeta a URL da API baked no bundle do Expo e os headers CORS do Django.

**IP Tailscale da VPS:** `100.89.1.62`

Para confirmar o IP da VPS a qualquer momento:
```bash
tailscale ip -4
```

---

## Fluxo normal (branch `develop`)

### Backend
```bash
docker compose up -d db backend
```
Roda na porta `8000`. O `LOCAL_IP` no `.env` já está configurado com o IP Tailscale — CORS e `ALLOWED_HOSTS` são gerados automaticamente.

### Frontend
```bash
cd frontend
nvm use 22
EXPO_PUBLIC_API_BASE_URL=http://100.89.1.62:8000/api/v1 BROWSER=none npx expo start --web --port 19006
```

> `BROWSER=none` é obrigatório na VPS — sem display, o Expo crasha tentando abrir browser automaticamente.

**Acessar:** `http://100.89.1.62:19006`

---

## Rodando de uma worktree

Worktrees permitem testar uma feature branch em paralelo com o `develop`. O backend da worktree roda em porta diferente para não conflitar.

### Portas por ambiente

| Ambiente | Backend | Frontend | URL no browser |
|----------|---------|----------|----------------|
| `develop` | `8000` | `19006` | `http://100.89.1.62:19006` |
| worktree feature | `8001` | `19010` | `http://100.89.1.62:19010` |

### 1. Subir o backend da worktree

```bash
WORKTREE=/root/code_projects/REQ-2026.1-T01-Liaison/.claude/worktrees/<nome-da-worktree>
SECRET_KEY=$(grep SECRET_KEY /root/code_projects/REQ-2026.1-T01-Liaison/.env | grep -v "#" | head -1 | cut -d= -f2-)

docker run -d \
  --name liaison_backend_<nome-da-worktree> \
  --network req-20261-t01-liaison_default \
  -e DATABASE_URL=postgres://postgres:postgres@db:5432/liaison \
  -e DJANGO_SETTINGS_MODULE=config.settings \
  -e SECRET_KEY=${SECRET_KEY} \
  -e LOCAL_IP=100.89.1.62 \
  -e CORS_ALLOWED_ORIGINS_EXTRA=http://100.89.1.62:19010 \
  -p 8001:8000 \
  -v "${WORKTREE}/backend:/app" \
  -w /app \
  req-20261-t01-liaison-backend:latest \
  sh -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"
```

Verificar se subiu:
```bash
curl http://100.89.1.62:8001/api/v1/auth/login/ -s -o /dev/null -w "%{http_code}"
# Esperado: 405
```

### 2. Subir o frontend da worktree

```bash
cd /root/code_projects/REQ-2026.1-T01-Liaison/.claude/worktrees/<nome-da-worktree>/frontend
nvm use 22
EXPO_PUBLIC_API_BASE_URL=http://100.89.1.62:8001/api/v1 BROWSER=none npx expo start --web --port 19010
```

**Acessar:** `http://100.89.1.62:19010`

### 3. Parar o ambiente da worktree

```bash
docker stop liaison_backend_<nome-da-worktree>
# Frontend: Ctrl+C no terminal
```

---

## Testes (sem precisar do backend rodando)

### Frontend
```bash
cd <worktree>/frontend
NODE_ENV=test npm test
```

> `NODE_ENV=test` é obrigatório — o profile da VPS exporta `NODE_ENV=production` por padrão, o que quebra o `act` do React Native Testing Library.

### Backend (container efêmero)
```bash
WORKTREE=/root/code_projects/REQ-2026.1-T01-Liaison/.claude/worktrees/<nome>

docker run --rm \
  --network req-20261-t01-liaison_default \
  -e DATABASE_URL=postgres://postgres:postgres@db:5432/liaison \
  -e DJANGO_SETTINGS_MODULE=config.settings \
  -v "${WORKTREE}/backend:/app" -w /app \
  req-20261-t01-liaison-backend:latest \
  python -m pytest
```

---

## Gerar token JWT sem senha (debug)

Útil para testar endpoints autenticados sem precisar fazer login pelo app.

```bash
docker exec liaison_backend_<nome> python -c "
import django, os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
u = get_user_model().objects.get(email='232037786@aluno.unb.br')
print(RefreshToken.for_user(u).access_token)
" 2>&1 | tail -1
```

### Contas de teste disponíveis

| Role | Email | Observação |
|------|-------|------------|
| estudante | `232037786@aluno.unb.br` | Tem perfil completo ✅ |
| estudante | `cintra.gustavo@hotmail.com` | Sem perfil de estudante ❌ |
| organização | `contato@organizacao.org` | Perfil aprovado ✅ |
| organização | `contato@org.com` | — |

---

## Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| `ERR_CONNECTION_REFUSED` no browser | Browser tenta `localhost`, mas o serviço está na VPS | Use `http://100.89.1.62:<porta>` |
| CORS bloqueando requests | Porta do frontend não está na allowlist | Adicione `-e CORS_ALLOWED_ORIGINS_EXTRA=http://100.89.1.62:<porta>` ao `docker run` |
| `spawn browser.sh ENOENT` | Expo tenta abrir browser na VPS sem display | Adicione `BROWSER=none` antes do comando |
| `ConfigError: package.json does not exist` | Expo rodando no diretório errado | `cd <worktree>/frontend` antes de rodar |
| App mostra spinner eterno | Backend não alcançado (CORS ou porta errada) | `F12 → Console` — procure erros `ERR_CONNECTION_REFUSED` ou `CORS policy` |
| Testes frontend quebram com `act` warning | `NODE_ENV=production` ativo | Sempre rodar com `NODE_ENV=test npm test` |
