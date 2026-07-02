# Auditoria de Sincronização — Documentação × Código (User Stories)

> **Projeto:** Liaison — REQ-2026.1-T01
> **Fonte da documentação:** Issues do GitHub que começam com `US` (backlog do GitHub Project #100 `REQ-2026.1-T01-Liaison`).
> **Fonte dos campos de priorização:** campos personalizados do GitHub Project #100 (ICE Score = I×C×E, MoSCoW, Quadrante).
> **Data da auditoria:** 2026-07-02
> **Método:** para cada US, os Critérios de Aceite (BDD/Gherkin) da issue foram confrontados com os endpoints DRF (`backend/*/urls.py`, `views.py`, `models.py`) e as telas do app (`frontend/src/screens`, `frontend/src/services`). Verificação estrutural + spot-check dos cenários com maior risco de divergência.

---

## 1. Tabela de campos (insumo para a matriz Esforço × Valor)

Todos os 30 itens `US` do backlog, com issue, título, status e campos personalizados do Project. `ICE = Impacto (I) × Confiança (C) × Facilidade (E)`.

| US | Issue | Título | Status | I | C | E | ICE | MoSCoW | Quadrante |
|----|-------|--------|--------|---|---|---|-----|--------|-----------|
| US1.1 | #12 | Cadastro de Estudantes Universitários (RF01) | Done | 10 | 8 | 7 | 560 | Must | Quick Win |
| US1.2 | #13 | Cadastro de Organizações Sociais (RF02) | Done | 10 | 7 | 6 | 420 | Must | Quick Win |
| US1.3 | #14 | Autenticação de Usuários (RF03) | Done | 8 | 8 | 7 | 448 | Must | Quick Win |
| US1.4 | #15 | Gestão de Perfil do Estudante (RF04) | Done | 7 | 8 | 6 | 336 | Must | Quick Win |
| US1.5 | #16 | Edição de Perfil Institucional da Organização (RF04) | Done | 7 | 8 | 6 | 336 | Must | Quick Win |
| US1.6 | #17 | Recuperação de Senha via E-mail (RF05) | Q/A | 5 | 6 | 7 | 210 | Won't | Quick Win |
| US1.7 | #18 | Painel Administrativo para Moderação de Organizações - Sysmin (RF06) | Done | 7 | 6 | 5 | 210 | Must | Quick Win |
| US2.1 | #19 | Criação de Vagas de Voluntariado (RF18) | Done | 10 | 7 | 5 | 350 | Must | Quick Win |
| US2.2 | #50 | Edição de Vagas de Voluntariado (RF19) | Done | 7 | 8 | 6 | 336 | Must | Quick Win |
| US2.3 | #51 | Publicação de Vagas de Voluntariado (RF20) | Done | 8 | 9 | 7 | 504 | Must | Quick Win |
| US2.4 | #52 | Encerramento de Vagas de Voluntariado (RF21) | Done | 6 | 8 | 7 | 336 | Should | Quick Win |
| US2.5 | #20 | Busca e Filtro de Vagas para Estudantes (RF08) | Done | 9 | 6 | 3 | 162 | Must | Plan |
| US2.6 | #21 | Visualização de Detalhes da Vaga (RF09) | Done | 8 | 9 | 7 | 504 | Must | Quick Win |
| US2.7 | #22 | Candidatura em Vaga de Voluntariado (RF10) | Done | 10 | 7 | 5 | 350 | Must | Quick Win |
| US2.8 | #24 | Avaliação de Candidaturas pela Organização (RF11) | Done | 9 | 7 | 5 | 315 | Must | Quick Win |
| US2.9 | #23 | Cancelamento de Candidatura (RF12) | Done | 8 | 7 | 6 | 336 | Must | Quick Win |
| US2.10 | #25 | Notificações de Status de Candidatura (RF12) | Done | 8 | 7 | 6 | 336 | Must | Quick Win |
| US2.11 | #86 | Acompanhamento de Minhas Candidaturas (RF12) | Done | 8 | 8 | 7 | 448 | Must | Quick Win |
| US2.12 | #111 | Ver Perfil da Organização (RF22) | Done | 5 | 9 | 9 | 567 | Should | Later |
| US2.13 | #119 | Ver Perfil do Estudante (RF23) | Done | 8 | 9 | 9 | 648 | Must | Quick Win |
| US2.14 | #112 | Listar Oportunidades Salvas (RF08) | Done | 4 | 9 | 9 | 324 | Should | — |
| US3.1 | #26 | Listagem de Estudantes Aprovados (RF13) | Done | 7 | 8 | 6 | 336 | Must | Quick Win |
| US3.2 | #27 | Registro de Frequência e Carga Horária (RF14) | Done | 9 | 7 | 4 | 252 | Must | Plan |
| US3.3 | #31 | Geração Automática de Certificado Digital (RF15) | Done | 10 | 5 | 3 | 150 | Must | Plan |
| US3.4 | #32 | Exportação de Certificado Digital em PDF (RF15) | Done | 10 | 5 | 3 | 150 | Must | Plan |
| US3.5 | #33 | Visualização de Histórico de Horas (RF16) | Backlog | 7 | 7 | 4 | 196 | Should | Plan |
| US3.6 | #34 | Download de Certificados (RF16) | Backlog | 7 | 7 | 4 | 196 | Should | Plan |
| US3.7 | #30 | Portal Público de Validação de Certificados (RF17) | Done | 6 | 5 | 4 | 120 | Could | Plan |
| US003.3 | #28 | Geração Automática de Certificado Digital em PDF (RF17, RF18) — *legada* | Done | — | — | — | — | — | — |
| US003.4 | #29 | Visualização de Histórico de Horas e Download de Certificados (RF19, RF21) — *legada* | Done | — | — | — | — | — | — |

> **Nota sobre #28 e #29 (`US003.3`/`US003.4`):** issues legadas, sem campos de matriz preenchidos, que duplicam o escopo já coberto por US3.3/US3.4/US3.5/US3.6. Recomenda-se fechar/arquivar para não inflar a contagem do backlog nem a matriz Esforço × Valor.

---

## 2. Veredito de sincronização por US

Legenda: ✅ Sincronizado · ⚠️ Divergência (ação necessária) · ⛔ Não implementado (coerente com status).

| US | Issue | Veredito | Observação |
|----|-------|----------|------------|
| US1.1 | #12 | ✅ | `student_register` + validações (email/matrícula únicos, senha, obrigatórios) + `RegisterScreen`. |
| US1.2 | #13 | ✅ | `organization_register` + CNPJ, moderação `status=pending`. |
| US1.3 | #14 | ✅ | `CustomTokenObtainPairView` (JWT), mensagem genérica, redirecionamento por role. |
| US1.4 | #15 | ✅ | Perfil, update, avatar/banner/galeria, change-password, dashboard read-only. |
| US1.5 | #16 | ✅ | Perfil org, logo/banner/galeria, change-password, perfil público. |
| US1.6 | #17 | ⚠️ | **Ver §3.1.** Fluxo de recuperação de senha não implementado. |
| US1.7 | #18 | ✅ | `approve` / `reject` / `request_info` + `IsAdmin` + tela admin. |
| US2.1 | #19 | ✅ | `create` (draft), validação de obrigatórios, permissão org. |
| US2.2 | #50 | ✅ | `update`/`partial_update` com trava de vaga encerrada; Cenário 5 pede apenas `updated_at` (existe). |
| US2.3 | #51 | ✅ | Ações `/publish/`, `/pause/`, `/resume/`; bloqueio de org não aprovada. |
| US2.4 | #52 | ✅ | Ações `/close/` e `/reopen/`; candidatura barrada em vaga encerrada. |
| US2.5 | #20 | ✅ | Busca, filtros, categorias, dashboard (meta de extensão), `featured`, salvar, candidatar. |
| US2.6 | #21 | ✅ | Retrieve público (active/paused/closed; draft→404), salvar, perfil da org. |
| US2.7 | #22 | ✅ | `create` com trava de duplicidade e vaga encerrada; confirmação no perfil. |
| US2.8 | #24 | ✅ | `evaluate` (approve/reject) com checagem de dono da vaga; lista por situação. |
| US2.9 | #23 | ✅ | `cancel` restrito a pendente e ao próprio estudante. |
| US2.10 | #25 | ✅ | App `notifications` + `NotificationsScreen` + service; lidas/não-lidas. |
| US2.11 | #86 | ✅ | `MyApplicationsScreen` com filtro, detalhe, cancelar, estado vazio. |
| US2.12 | #111 | ✅ | `OrganizationPublicProfileView` (só aprovadas → 404) + `PublicOrgProfileScreen`. |
| US2.13 | #119 | ✅ | `StudentPublicProfileView` + `PublicStudentProfileScreen`. |
| US2.14 | #112 | ✅ | Endpoint `/opportunities/saved/` + `SavedOpportunitiesScreen`. |
| US3.1 | #26 | ✅ | `list_by_opportunity` (aprovados) com checagem de dono. |
| US3.2 | #27 | ✅ | `complete` (present/partial/absent, horas, dedup, dono, imutável). |
| US3.3 | #31 | ✅ | Certificado emitido automaticamente no `complete` (present/partial) via `issue_certificate`. |
| US3.4 | #32 | ⚠️ | **Ver §3.2.** Download individual OK; exportação em lote (zip) ausente. |
| US3.5 | #33 | ⛔ | Status Backlog. Tela dedicada de histórico não existe (parcial via dashboard/MyApplications). |
| US3.6 | #34 | ⛔ | Status Backlog. Coberto parcialmente pelo download em `MyApplicationsScreen`. |
| US3.7 | #30 | ✅ | `validate_certificate` + `validate_form` públicos; QR aponta para `/validar/<uuid>`. |

---

## 3. Divergências que exigem ação

### 3.1 — US1.6 (#17) — Recuperação de Senha via E-mail
- **Documentação:** 5 cenários BDD redigidos como funcionalidade entregue (solicitação, e-mail não cadastrado, link válido, link expirado, nova senha ≠ anterior).
- **Código:** não há endpoint de recuperação/reset. Existe apenas `change-password` (autenticado). Nenhum fluxo de token por e-mail.
- **Coerência:** MoSCoW = **Won't**, status = **Q/A** — o não-implementado é intencional para o MVP. A própria issue tem a seção *"A funcionalidade será considerada pronta quando (em releases futuras)"*, mas os cenários acima estão escritos no presente, como se entregues.
- **Ação (sincronizar):** reescrever os 5 cenários BDD com marcação explícita de *"Planejado — release futura"* (ou mover o corpo detalhado para uma seção "Escopo Futuro"), evitando leitura de que o fluxo está entregue. Nenhuma alteração de código necessária no MVP.

### 3.2 — US3.4 (#32) — Exportação de Certificado Digital em PDF
- **Cenário 1 (Download individual):** ✅ implementado — endpoint `GET /api/v1/certificates/<uuid>/download/` consumido em `MyApplicationsScreen` (`handleDownloadCertificate`).
- **Cenário 2 (Exportação de múltiplos certificados / zip):** ⚠️ **não implementado.** Não existe endpoint de exportação em lote nem seleção múltipla na UI. Só download unitário.
- **Cenário 3 (Visualização prévia em visualizador integrado):** parcial — o download abre o PDF no visualizador do dispositivo/navegador, não em um viewer in-app dedicado.
- **Ação — escolher uma via:**
  - **(a) Alinhar código à doc:** criar ação `POST /certificates/export/` que recebe uma lista de IDs e devolve um `.zip`; adicionar seleção múltipla + botão "Exportar selecionados" na tela de certificados/candidaturas.
  - **(b) Alinhar doc ao código (recomendado p/ MVP):** rebaixar o Cenário 2 (e o "visualizador integrado" do Cenário 3) para *"Planejado"*, mantendo apenas o download individual como entregue. Coerente com MoSCoW/quadrante (Plan, ICE 150).

### 3.3 — US3.5 (#33) / US3.6 (#34) — Histórico de Horas / Download pelo histórico
- **Status:** ambas em **Backlog** — não fazem parte do MVP entregue.
- **Código:** não há tela dedicada de "Histórico de Horas". Parte do valor já é entregue por outras telas (dashboard do estudante com horas de extensão; download de certificado em `MyApplicationsScreen`).
- **Ação:** nenhuma correção de código. Garantir que essas duas US **não** sejam contabilizadas como "entregues/100%" nos documentos de completude (ver §4). Doc e status já estão coerentes entre si.

---

## 4. Inconsistência entre documentos (não é código)

`docs/organizacao_e_planejamento/MVP/index.md` declara **"100% Concluído / 19 itens Must Have"**. Isso é coerente para o subconjunto *Must Have do MVP*, mas o backlog `US` tem **30 itens**, incluindo US1.6 (Won't/Q/A) e US3.5/US3.6 (Backlog) que **não** estão entregues. Recomenda-se deixar explícito no `index.md` que o "100%" refere-se apenas aos 19 *Must Have* da release, para não conflitar com o backlog completo desta auditoria.

---

## 5. Implementado ALÉM da documentação (código > doc)

Funcionalidades presentes no código que **nenhuma US descreve**. Aqui a ação de sincronização é o inverso: **documentar** (retro-documentar na US correspondente) ou decidir se o excedente deve permanecer.

### 5.1 — Modalidade da vaga (`modality`)
- **Código:** campo `Opportunity.modality` com choices **presencial / remoto / híbrido**. Exibido no `OpportunityCard`, na `OpportunityDetailScreen`, e usado como **filtro de busca** (`opportunities.ts` envia `modality` na query).
- **Documentação:** nenhuma US lista modalidade. US2.1 (criação) só cita `title/description/workload_hours/event_date/location/requirements/status`; US2.6 (detalhe) e US2.5 (filtros) não mencionam modalidade.
- **Ação:** retro-documentar o campo em **US2.1** (criação) e o filtro em **US2.5**.

### 5.2 — Recorrência da vaga (`is_recurring`, `session_duration`)
- **Código:** `Opportunity.is_recurring` (bool) + `session_duration` (DurationField) — vagas recorrentes com duração de sessão; expostos no serializer de detalhe e na `OpportunityDetailScreen`.
- **Documentação:** US2.6 documenta apenas `schedule` como *"cronograma (marcos da vaga)"*; a recorrência propriamente dita (`is_recurring` + `session_duration`) não é descrita em nenhuma US.
- **Ação:** retro-documentar em **US2.1** (criação de vaga recorrente) e **US2.6** (exibição).

### 5.3 — Verificação de disponibilidade em tempo real (`check-email` / `check-matricula`)
- **Código:** endpoints `GET /api/v1/auth/check-email/` e `GET /api/v1/auth/check-matricula/` — checagem de disponibilidade **antes** da submissão do cadastro.
- **Documentação:** US1.1/US1.2 descrevem apenas a mensagem de erro **na submissão** ("Este e-mail já está em uso" / "Esta matrícula já está em uso"), não um endpoint dedicado de verificação prévia.
- **Ação:** retro-documentar como requisito técnico em **US1.1** e **US1.2**.

> **Também presentes e JÁ documentados** (verificados, não são excedente): `AdminActionLog` (auditoria — descrito em US1.7), revogação de certificado na validação pública (descrito em US3.7), ação `/resume/` de reativar vaga (descrita em US2.3), galeria de fotos da vaga e cursos preferenciais/público-alvo (descritos em US2.6).

---

## 6. Resumo executivo

- **Sincronizadas (código == doc):** 25 US.
- **Divergências com ação (doc > código):** 2 US — **US1.6** (doc descreve como entregue algo intencionalmente fora do MVP) e **US3.4** (exportação em lote documentada, não implementada).
- **Implementado além da doc (código > doc):** 3 itens — **modalidade da vaga**, **recorrência da vaga** e **endpoints de verificação de disponibilidade** (retro-documentar).
- **Não implementadas coerentes com status:** US3.5 e US3.6 (Backlog).
- **Higiene de backlog:** fechar issues legadas **#28** e **#29**.
- **Conclusão:** o código está **majoritariamente sincronizado** com a documentação. As correções pendentes são, em sua maioria, ajustes de redação (marcar cenários futuros como planejados — §3; retro-documentar excedentes — §5), não de implementação — exceto a exportação em lote de certificados (US3.4 Cenário 2), que exige código caso se decida entregá-la.
