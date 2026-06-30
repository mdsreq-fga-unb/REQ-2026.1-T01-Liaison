## Contexto

Durante a revisão do PR #99, ao rodar a suíte de testes do backend, identificamos 10 testes falhando na branch `develop`. Confirmamos que não são regressões do PR #99 — eles já falham na `develop` sem o PR. São falhas preexistentes em duas áreas: login por CNPJ e moderação de organizações.

Impacto: ambas as áreas fazem parte da R1 (login de organização e moderação), atualmente marcada como concluída.

### Como reproduzir

docker compose exec backend pytest users/tests/test_login_cnpj.py users/tests/test_admin_moderation.py

Resultado atual: 10 failed, 6 passed.

---

## Bloco A — Moderação de organizações (4 falhas)

Responsável sugerido: @HenriqueFontenelle

A1. Rotas approve/reject/request-info retornam 404 (3 falhas)
- Testes: test_approve_and_log, test_reject_requires_reason, test_request_info_requires_message
- Causa: em config/urls.py, as rotas de admin/organizations/ usam o conversor <uuid:pk>, mas OrganizationProfile tem PK inteiro — o conversor uuid não casa com IDs numéricos, gerando 404 antes de chegar na view.
- Correção: trocar <uuid:pk> por <int:pk> nas três rotas.

A2. Listagem quebra com AttributeError (1 falha)
- Teste: test_list_pending
- Erro: 'PageNumberPagination' object has no attribute 'page'
- Causa: em users/views.py (~linha 111-114), paginate_queryset retorna None (PAGE_SIZE não configurado) e o código chama get_paginated_response mesmo assim.
- Correção: configurar PAGE_SIZE no settings OU guardar o caso None.

---

## Bloco B — Login por CNPJ (6 falhas)

Responsável sugerido: @auslogyc

- Testes: test_valid_cnpj_wrong_password_returns_401, test_nonexistent_cnpj_returns_401, test_pending_org_blocked_returns_403, test_rejected_org_blocked_returns_403, test_inactive_user_cnpj_login_returns_401, test_login_without_email_or_cnpj_returns_400
- Local: users/serializers.py (CustomTokenObtainPairSerializer.validate)
- Causas:
  1. KeyError: 'email' — no login sem email (só CNPJ) ou sem nenhum dos dois, o fluxo cai no super().validate(attrs), que exige o campo email e estoura.
  2. Códigos de status incorretos — o serializer levanta ValidationError (vira HTTP 400) para senha errada, CNPJ inexistente e inativo (esperado 401) e para org pendente/rejeitada (esperado 403). Correção: usar AuthenticationFailed (401) e PermissionDenied (403) em vez de ValidationError.

---

Descoberto durante a revisão do PR #99.
