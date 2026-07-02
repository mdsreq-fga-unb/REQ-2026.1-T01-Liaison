# Gotchas — Liaison

Quick reference for non-obvious pitfalls. Core context em CLAUDE.md.

---

## Backend — Django / DRF

### Migration aplicada não re-executa ao editar model
Editar um model já migrado não muda o schema. Drop/recreate do DB de teste. Prefixos lineares únicos (0001→0002…).

### Remover campo de model tem efeito em cascata
Atualizar model **+** serializer (`Meta.fields`) **+** tests **+** `grep` o nome no codebase inteiro — inclui interfaces/fixtures TS do frontend. DRF ignora campo extra silenciosamente (não dá erro).

### Criação multi-objeto = atomic no serializer, não na view
```python
# CORRECT — no save() do serializer
@transaction.atomic
def save(self, **kwargs):
    user = User.objects.create(...)
    StudentProfile.objects.create(user=user, ...)
```

### Delete seguro — ownership na mesma query
```python
# BROKEN — vaza existência do objeto
obj = get_object_or_404(Model, id=x)
if obj.owner != profile: raise PermissionDenied

# CORRECT — 404 se não for dono, sem info leak
obj = get_object_or_404(Model, id=x, owner=profile)
```

### Endpoint público precisa AllowAny explícito
Default DRF é `IsAuthenticated`. Esquecer `@permission_classes([AllowAny])` → 401 num endpoint que devia ser público (login, register, health).

### ImageField (Pillow)
- Teste precisa imagem real: `PILImage.new(...)` → BytesIO JPEG.
- Oversize "válido" = garbage após EOF `0xFFD9`.
- `ImageField(null=True)` retorna `ImageFieldFile` mesmo vazio → cheque `.name`, não o objeto.
- View de upload precisa `parser_classes=[MultiPartParser, FormParser]`.

### Login por CNPJ
CNPJ armazenado como dígitos puros. Strip da máscara antes de validar/buscar.

### `id` de profile ≠ `user.id`
`StudentProfile`/`OrganizationProfile` têm PK **inteiro** (AutoField). O `id` canônico exposto pela API (`/me/`, login, registro, detail serializers via `source="user.id"`) é o **UUID do User**. Rotas públicas de perfil keyam por `user_id`, não pelo PK do profile. `opportunity.organization.id` é o PK inteiro do profile (legado) — para navegar ao perfil público use `organization.user_id`.

---

## Frontend — Expo / React Native

### EXPO_PUBLIC_ é o único prefixo exposto ao bundle
Qualquer env sem esse prefixo é `undefined` no app. `API_BASE_URL` vem de `EXPO_PUBLIC_API_BASE_URL`.

### Versões nativas seguem o SDK
Seguir tabela de versões do SDK (`expo doctor`). `jest@29` obrigatório — v30 quebra `jest-expo`.

### FormData.append precisa `as any`
```typescript
// RN não tipa {uri,name,type}
formData.append("image", { uri, name, type } as any);
```

### Header sem barra nativa precisa paddingTop
`headerShown:false` → conteúdo invade status bar → `paddingTop:50`.

### Chave de StyleSheet errada = bug silencioso
Referência a chave inexistente vira `undefined`. Sem erro; testes passam. Conferir nomes.

### Tokens obrigatórios
Cor/spacing hardcoded é bug. Sempre `src/theme/{colors,typography,spacing}`.

---

## Testing

### RNTL
- `getByText` lança em texto duplicado → use `getAllByText`.
- SecureStore mock contamina entre testes → resetar em `beforeEach`.
- `fireEvent.press` precisa estar dentro de `act()`.
- `instanceof ApiError` precisa de instância real (não objeto plano).
- Jest `--coverage` em forms multi-step → `--testTimeout=30000`.

### pytest-django
- DB real Postgres. Reset do test DB:
  ```bash
  docker compose exec db psql -U postgres -c "DROP DATABASE liaison_test; CREATE DATABASE liaison_test;"
  ```
- `pytest-cov` **não** está em requirements.txt — coverage backend não roda out-of-the-box.

---

## Infra / CI

### Testes não rodam no CI
CI só faz deploy do MkDocs. Rodar `pytest` / `npm test` localmente antes de PR.

### Storage difere por ambiente
`USE_S3=False` (dev) salva em `MEDIA_ROOT`, servido só com `DEBUG=True`. `USE_S3=True` (prod) precisa de credenciais AWS — bug de upload em prod costuma ser env de S3 faltando.
