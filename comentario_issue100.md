## Atualização de status (27/06)

**Bloco A — Moderação: corrigido, aguardando merge (PR #101).**

Ao implementar, dois ajustes em relação ao diagnóstico inicial:

- **A1 (rotas 404):** ao conferir o código atual, o conversor das rotas de `admin/organizations/` já estava como `<int:pk>` — então a parte de roteamento já não causava mais 404. O que faltava era a paginação (A2) e o media type dos testes (`format="json"` nos POSTs de reject/request-info).
- **A2 (paginação):** a primeira tentativa configurou `DEFAULT_PAGINATION_CLASS` + `PAGE_SIZE` globais no settings, mas isso ativava paginação em **toda** a API e mudava o formato de resposta de todos os endpoints de listagem (`[...]` → `{"count":...,"results":[...]}`), o que quebraria a HomeScreen do app (boa pegada do @Pedrovargas10 na revisão). A correção final usa uma classe de paginação **local** (`AdminPagination`) aplicada só na `AdminOrganizationViewSet`, sem efeito colateral nos demais endpoints.

Validação: `pytest users/tests/test_admin_moderation.py` → 4 passed; `pytest opportunities/` → 32 passed (sem regressão). Os 4 testes do Bloco A passam.

**Bloco B — Login por CNPJ: segue com @auslogyc**, sem alteração. As 6 falhas continuam abertas (diagnóstico no corpo da issue acima permanece válido).

A issue será fechada quando os dois blocos estiverem resolvidos (Bloco A após o merge do #101; Bloco B após a correção do login CNPJ).