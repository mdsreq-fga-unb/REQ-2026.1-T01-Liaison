# Folder Architecture — Liaison

> **Last Updated:** 2026-06-28

## Root

```
REQ-2026.1-T01-Liaison/
├── backend/            Django REST API (apps + config)
├── frontend/           Expo / React Native app
├── docs/               MkDocs (entregas, projeto, lições)
├── docker-compose.yml  db + backend
├── deploy.sh           script de deploy
└── CLAUDE.md           contexto Claude Code (core + índice de context files)
```

---

## backend/

```
backend/
├── config/             settings.py + urls.py (rotas raiz, todas em /api/v1/)
├── users/              ✅ User, StudentProfile, OrganizationProfile, galerias, AdminActionLog
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py  IsAdmin / IsAdminOrSelf / IsEstudante / IsOrganizacao
│   ├── migrations/
│   └── tests/          pytest-django (DB real Postgres)
├── opportunities/      ✅ Opportunity, OpportunityPhoto, OpportunityViewSet
│   ├── urls.py         DefaultRouter (registrado em config/urls.py)
│   └── tests/
├── applications/       ⏳ placeholder vazio
├── certificates/       ⏳ placeholder vazio
├── media/              uploads locais (DEBUG; em prod vai p/ S3)
├── manage.py
├── pytest.ini
└── requirements.txt
```

**Convention — novo endpoint:**
1. Model em `<app>/models.py` → `makemigrations` (prefixos lineares 0001→0002…).
2. Serializer em `<app>/serializers.py` (campos em `Meta.fields`).
3. View (APIView/ViewSet) em `<app>/views.py` com `permission_classes`.
4. Rota: viewsets via router em `<app>/urls.py` + `include()` no `config/urls.py`; rotas avulsas direto em `config/urls.py`. Path em `kebab-case`, sob `/api/v1/`.
5. Teste em `<app>/tests/`.

**Convention — novo app Django:**
- `python manage.py startapp <nome>` dentro de `backend/`, adicionar em `INSTALLED_APPS`.

---

## frontend/

```
frontend/
├── App.tsx             root: AuthProvider → NavigationContainer → RootNavigator
├── src/
│   ├── components/     auth/ · profile/ · ui/  (PascalCase.tsx, testes co-localizados em __tests__)
│   ├── config/         api.ts (API_BASE_URL de EXPO_PUBLIC_API_BASE_URL)
│   ├── constants/
│   ├── context/        AuthContext (useAuth, authenticatedFetch)
│   ├── navigation/     RootNavigator + stacks por role
│   ├── screens/        telas (pastas kebab-case)
│   ├── services/       api.ts (funções + ApiError)
│   ├── theme/          colors / typography / spacing (tokens — uso obrigatório)
│   ├── types/          interfaces TS (espelham serializers DRF)
│   └── utils/
├── __mocks__/          mocks Jest (@expo, SecureStore)
├── assets/             ícones, 29 SVGs custom, fontes
├── app.json            config Expo
├── metro.config.js     react-native-svg-transformer
└── package.json
```

**Convention — nova tela:**
1. Pasta `kebab-case` em `src/screens/`, componente `PascalCase.tsx`.
2. Registrar no stack apropriado em `src/navigation/` (gate por role).
3. Chamada de API em `src/services/api.ts`; tipos em `src/types/`.
4. Estilo só via tokens de `src/theme/` (sem NativeWind, sem cores hardcoded).

**Pastas não óbvias:**
- `__mocks__/` — mocks Jest globais (SecureStore contamina entre testes → resetar em `beforeEach`).
- `theme/` — única fonte de cores/tipografia/spacing.
