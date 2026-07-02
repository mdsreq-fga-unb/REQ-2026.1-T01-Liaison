# Repriorização do Backlog — o que mudou no ICE

> Revisão dos scores **I × C × E** contra a rubrica de `docs/projeto/backlog_produto.md` (§10.2.1).
> Rubrica: **I** 1–6 baixo / 7–8 médio (parte do ciclo extensão→certificado) / 9–10 existencial. **C** 1–3 nunca feito / 4–6 tech nova (Django Admin custom, PDF estilizado, search multi-filtro, Celery/SMTP) / 7–10 CRUD DRF padrão / nativo. **E** 1–4 >18h (fatiar) / 5–7 6–18h / 8–10 <6h.
> Escopo desta revisão: **apenas ICE**. Mudanças de banda MoSCoW são apresentadas como **recomendação** (decisão do time).

## 1. Alterações de score (ICE)

| US | Item | I (de→p/) | C (de→p/) | E (de→p/) | ICE (de→p/) | Motivo |
|----|------|:---:|:---:|:---:|:---:|--------|
| **US2.13** | Ver Perfil do Estudante | 8→**6** | 9 | 9 | 648→**486** | Tela de leitura de apoio à avaliação; não é crítica do ciclo extensão→certificado. I=8 inflava um read-only ao topo do backlog (era #1, acima de cadastro e candidatura). I=6 → sai de Quick Win p/ **Later**. |
| **US2.10** | Notificações de Status | 8→**7** | 7→**5** | 6→**5** | 336→**175** | Infra de push/e-mail (Expo Push / Celery / SMTP) é tech nova p/ o time → C na zona 4–6. Entrega multi-sistema → E menor. Impacto real é engajamento, não existencial. |
| **US2.9** | Cancelar Candidatura | 8→**6** | 7 | 6 | 336→**252** | Conveniência do estudante; não bloqueia o ciclo. Impacto menor que candidatar (US2.7). I=6 → **Later**. |
| **US1.3** | Autenticação | 8→**9** | 8 | 7 | 448→**504** | Fundacional/existencial: sem login não há acesso ao ciclo. Rubrica I=9 ("sem isso o SaaS não entrega o ciclo"). Sobe p/ o topo do MVP. |
| **US1.7** | Painel de Moderação (Sysmin) | 7 | 6→**7** | 5→**6** | 210→**294** | Assumindo **Django Admin nativo** (só ações approve/reject customizadas): C sai da zona de incerteza e E cresce. Se for painel 100% custom, manter 6/5. |
| **US2.4** | Encerrar Vaga | 6 | 8 | 7→**8** | 336→**384** | Mudança de status é trivial (<6h). |
| **US3.4** | Exportação de Certificado (PDF) | 10→**7** | 5→**7** | 3→**7** | 150→**294** | O valor central do certificado já é capturado em **US3.3 (geração)**. Uma vez resolvida a geração do PDF, exportar é resposta de arquivo padrão (fácil, confiável). ⚠️ Depende de US3.3. |
| **US3.6** | Download de Certificados | 7→**6** | 7 | 4→**6** | 196→**252** | Mesma lógica de US3.4 — dependente e barato após US3.3. ⚠️ **Quase-duplicata de US3.4** (ver §3). |
| **US3.5** | Histórico de Horas | 7 | 7 | 4→**5** | 196→**245** | Agregação + tela de leitura; 6–18h, não >18h. E=5 → **Quick Win**. |
| **US1.6** | Recuperação de Senha | 5→**6** | 6 | 7 | 210→**252** | Prevenção de churn: usuário travado abandona a plataforma (rubrica "remove fricção que causa abandono"). Segue como Won't nesta revisão, mas ver recomendação §2. |

Itens **sem alteração de score**: US1.1, US1.2, US1.4, US1.5, US2.1, US2.2, US2.3, US2.5, US2.6, US2.7, US2.8, US2.11, US2.12, US2.14, US3.1, US3.2, US3.3, US3.7.

## 2. Recomendações de banda MoSCoW (decisão do time)

| US | Item | De → Para | Motivo |
|----|------|-----------|--------|
| US1.6 | Recuperação de Senha | Won't → **Should** | Recuperação de senha é fricção real de acesso; Won't no MVP tende a gerar contas perdidas. ICE 252 é alto para um item descartado. |
| US2.14 | Listar Oportunidades Salvas | Should → **Could** | Bookmark puro, I=4 (afeta <50% e não toca o ciclo). Não compete com os demais Should. |

## 3. Notas estruturais (não-ICE)

- **Duplicação US3.4 × US3.6:** "Exportação em PDF" e "Download de Certificados" são a mesma capacidade (obter o certificado em PDF). **Recomendo fundir em uma única US** ("Obter certificado em PDF") para não contar valor duas vezes.
- **Dependência US3.3 → US3.4/US3.6:** o ICE não modela dependência (limitação da Matriz, já documentada). US3.4/US3.6 aparecem com ICE > US3.3 (geração) por serem baratos, mas **só executam depois** de US3.3. O sequenciamento real no KanbanXP resolve a cadeia.
- **US3.3 (Geração de Certificado):** mantido 10/5/3 = 150. C=5 permanece o maior risco do backlog — **spike técnico obrigatório** (reportlab/weasyprint) antes de puxar.

## 4. Correções de quadrante (erros na fonte, independem do ICE)

A coluna Quadrante do `matriz-esforco-valor-dados.md` tinha itens I≤6 marcados como Quick Win (que exige I≥7):

| US | Fonte dizia | Correto (rubrica) | Por quê |
|----|-------------|-------------------|---------|
| US2.4 | Quick Win | **Later** | I=6 é baixo impacto (Quick Win exige I≥7). |
| US1.6 | Quick Win | **Later** | I=6 baixo, E≥5. |
| US3.7 | Plan | **Drop** | I=6 baixo e E=4 baixo → quadrante Drop. |

## 5. Impacto no ranking (principais movimentações)

- **US2.13** cai de **#1 → #5** (deixa de ofuscar o núcleo cadastro/candidatura).
- **US1.3 (Auth)** sobe para **#2** (perto do topo, como fundação).
- **US2.10 (Notificações)** despenca dentro do Must (ICE 336→175) — reflete a complexidade real da infra.
- **US3.4/US3.5** saem de **Plan → Quick Win**; **US3.6 → Later**.
- Contagem por banda inalterada: Must 21 · Should 5 · Could 1 · Won't 1.

> Aplicado em `docs/projeto/backlog_priorizado.md` (tabela reordenada) e na matriz `matriz-facilidade-valor.html`. As recomendações de MoSCoW (§2) e a fusão de US (§3) aguardam tua decisão.
