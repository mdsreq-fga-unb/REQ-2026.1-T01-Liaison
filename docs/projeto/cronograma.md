# 5 CRONOGRAMA E ENTREGAS

O projeto adota **KanbanXP** como framework de desenvolvimento. As releases são incrementais e cumulativas — cada uma entrega um conjunto coeso de funcionalidades que agregam valor direto ao usuário final. Infraestrutura e configuração de ambiente são incorporadas conforme a necessidade de cada release, nunca concentradas em etapa isolada.

## 5.1 Plano de Releases

| Release | Data | Objetivo | Escopo | Valor Entregue | Status | Evidências |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R1 — Fundação** | 26/05/2026 | Cadastro e Acesso Seguro | Cadastro de estudantes e orgs. Autenticação. Moderação. Segurança. | Os três perfis de usuário conseguem se cadastrar e acessar com segurança. | ✅ **Concluído** | PRs #55, #57, #58, #60, #64, #65, #66 |
| **R2 — Perfis e Conexão** | 16/06/2026 | Personalização e Descoberta | Gestão de perfis. Busca e visualização de vagas. Candidatura. | Estudantes descobrem vagas e se candidatam; perfis enriquecidos. | ✅ **Concluído** | PRs #83, #84, #87, #97, #99, #101, #113 |
| **R3 — Gestão e Triagem** | 30/06/2026 | Ciclo Operacional das Vagas | Criação, edição. Avaliação de candidatos (aprovar/recusar). Status tracking. | Organizações gerenciam suas vagas. Acompanhamento de status mobile. | ✅ **Concluído** | PRs #117, #118, #120, #121, #123, #124 |
| **R4 — Certificação** | 14/07/2026 | Fechamento do Ciclo | Lista de aprovados. Frequência. Certificado digital imutável. | A organização atesta a participação e o estudante recebe o certificado verificável. | ✅ **Concluído** | PRs #116, #125, #126 |

## 5.2 Execução Real por User Story

> **Última atualização:** 01/07/2026 (revisão final, pós-aprovação)
> **Método de levantamento:** cruzamento entre `gh issue list`, `gh pr list --json closingIssuesReferences` (vínculo oficial PR→issue) e o backlog formal (`backlog_produto.md`), executado nesta data. Não é uma estimativa — cada status abaixo tem evidência de código (PR) ou ausência dela verificada diretamente no repositório.
> **Nota:** este documento foi entregue via PR #132, aprovado pelo monitor Luan Duarte e mergeado em 01/07/2026. Entre a submissão e a aprovação, diversas USs adicionais foram entregues e suas issues fechadas — esta revisão incorpora esse estado mais atual.

**Legenda de status:**

| Símbolo | Significado |
| :---: | :--- |
| ✅ | Entregue — código mergeado na `develop` e issue fechada |
| 🔵 | Em andamento — PR aberto, ainda não mergeado |
| ⚪ | Pendente — sem PR aberto até o momento |
| ❌ | Descartada — removida do escopo por decisão de equipe |

### 5.2.1 R1 — Fundação

| US | Descrição | Status | Evidência | Observações |
| :--- | :--- | :---: | :--- | :--- |
| **US1.1** | Cadastro de Estudantes (RF01) | ✅ | [PR #55](../../../pull/55) | — |
| **US1.2** | Cadastro de Organizações (RF02) | ✅ | [PR #60](../../../pull/60), [PR #63](../../../pull/63) | — |
| **US1.3** | Autenticação de Usuários (RF03) | ✅ | [PR #58](../../../pull/58) | — |
| **US1.4** | Gestão de Perfil do Estudante (RF04) | ✅ | [PR #64](../../../pull/64), [PR #65](../../../pull/65) | — |
| **US1.5** | Edição de Perfil da Organização (RF04) | ✅ | [PR #66](../../../pull/66) | — |
| **US1.6** | Recuperação de Senha via E-mail (RF05) | 🔵 | [PR #93](../../../pull/93) (aberto) | **Desvio de escopo:** classificada como *Won't Have* na priorização do MVP (10.2.2 do backlog), com decisão registrada na issue de que a recuperação seria manual no lançamento inicial. A própria issue previa a possibilidade de antecipação futura, o que ocorreu — o time iniciou o desenvolvimento (PR #93), ainda sem merge. Está fora do escopo formal do MVP, mas em andamento por decisão do time. |
| **US1.7** | Moderação de Organizações — Sysmin (RF06) | ✅ | [PR #101](../../../pull/101) (fix de rotas/paginação) | Bug #100 relacionado (10 testes falhando) corrigido no mesmo PR. |

**R1: 6 de 7 USs entregues (86%). 1 em andamento fora do MVP formal.**

### 5.2.2 R2 — Perfis e Conexão

| US | Descrição | Status | Evidência | Observações |
| :--- | :--- | :---: | :--- | :--- |
| **US2.1** | Criação de Vagas (RF18) | ✅ | [PR #83](../../../pull/83), [PR #99](../../../pull/99), [PR #123](../../../pull/123) | — |
| **US2.2** | Edição de Vagas (RF19) | ✅ | [PR #99](../../../pull/99) | — |
| **US2.3** | Publicação de Vagas (RF20) | ✅ | [PR #99](../../../pull/99) | — |
| **US2.4** | Encerramento de Vagas (RF21) | ✅ | [PR #99](../../../pull/99) | — |
| **US2.5** | Busca e Filtro de Vagas (RF08) | ✅ | [PR #87](../../../pull/87) | — |
| **US2.6** | Visualização de Detalhes da Vaga (RF09) | ✅ | [PR #113](../../../pull/113) | — |
| **US2.7** | Candidatura em Vaga (RF10) | ✅ | [PR #113](../../../pull/113) | — |
| **US2.8** | Avaliação de Candidaturas pela Organização (RF11) | ✅ | [PR #118](../../../pull/118), [PR #125](../../../pull/125) | Issue fechada. |
| **US2.9** | Cancelamento de Candidatura (RF12) | ✅ | [PR #130](../../../pull/130) | Entregue no PR de release consolidado. O PR #114 (rascunho inicial só com frontend/mock, de Henrique Fontenelle) foi fechado sem merge por ter sido superado por esta entrega integrada. |
| **US2.10** | Notificações de Status de Candidatura (RF12) | ✅ | [PR #120](../../../pull/120), [PR #122](../../../pull/122) | Issue fechada. |
| **US2.11** | Acompanhamento de Minhas Candidaturas (RF12) | ✅ | [PR #117](../../../pull/117), [PR #124](../../../pull/124) | Issue fechada. |

**R2: 11 de 11 USs do escopo original entregues (100%).**

> **Desvio de escopo — USs adicionais não rastreadas no backlog:** durante a execução, foram criadas e implementadas três USs que **não constam na tabela oficial do backlog** (`backlog_produto.md`, seção 10.1): perfis públicos de estudante e organização, e listagem de vagas salvas. Estão documentadas abaixo para transparência, mas recomenda-se formalizar sua inclusão no backlog em revisão futura.

| US (issue) | Descrição | Status | Evidência | Observações |
| :--- | :--- | :---: | :--- | :--- |
| US2.12 (#111) | Ver Perfil da Organização | ✅ | [PR #121](../../../pull/121), [PR #130](../../../pull/130) | Issue fechada. |
| US2.13 (#119) | Ver Perfil do Estudante | ✅ | [PR #121](../../../pull/121), [PR #130](../../../pull/130) | Issue fechada. |
| US2.14 (#112) | Listar Oportunidades Salvas | ✅ | [PR #130](../../../pull/130) | Issue fechada. |

### 5.2.3 R3 — Gestão e Triagem / R4 — Certificação

| US | Descrição | Status | Evidência | Observações |
| :--- | :--- | :---: | :--- | :--- |
| **US3.1** | Listagem de Estudantes Aprovados (RF13) | ✅ | [PR #126](../../../pull/126) | Issue fechada. |
| **US3.2** | Registro de Frequência e Carga Horária (RF14) | ✅ | [PR #126](../../../pull/126) | Issue fechada. |
| **US3.3** | Geração Automática de Certificado Digital (RF15) | ✅ | [PR #116](../../../pull/116) | Issue fechada. Issues #28/#29 (antigas, duplicadas) já estavam fechadas com label `duplicate`. |
| **US3.4** | Exportação de Certificado em PDF (RF15) | ✅ | [PR #116](../../../pull/116) | Issue fechada. **Atualização de status (decisão de equipe, reunião de 01/07/2026):** os cenários 2 (exportação em lote) e 3 (visualizador integrado) estavam originalmente marcados como planejados/parciais na descrição da issue; o time avaliou em reunião que a entrega atende ao critério de pronto e reclassificou a US como completa. |
| **US3.5** | Visualização de Histórico de Horas (RF16) | ❌ | — | **Descartada por decisão de equipe:** removida do escopo (decisão do líder, com aval da equipe, registrada em reunião). Não há PR ou evidência de código associada — item cancelado antes do início do desenvolvimento. |
| **US3.6** | Download de Certificados (RF16) | ✅ | [PR #116](../../../pull/116) | Issue fechada. Confirmado via `closingIssuesReferences` do PR #116 (que também fecha #30 e #31) e verificação dos arquivos alterados no app `certificates`. **Nota de escopo:** o endpoint de download foi implementado, mas a integração visual na tela de histórico (US3.5) não existe, já que essa US foi descartada — o download está disponível por outra via de acesso ao certificado, não pelo fluxo originalmente descrito no Cenário 1 da issue (a partir da tela de histórico). |
| **US3.7** | Portal Público de Validação de Certificados (RF17) | ✅ | [PR #116](../../../pull/116) | Issue fechada. **Nota de rastreabilidade:** há inconsistência no backlog — o RF17 aparece como *Could Have* na tabela de priorização (10.2.2) mas como *Should Have* no texto da seção 10.5; recomenda-se alinhar. |

**R3/R4: 6 de 7 USs entregues (86%, considerando a US3.5 removida do escopo ativo). 1 descartada (US3.5).**

### 5.2.4 Consolidado Geral

| Release | Planejadas | Entregues (✅) | Em andamento (🔵) | Descartadas (❌) |
| :--- | :---: | :---: | :---: | :---: |
| R1 | 7 | 6 | 1 | 0 |
| R2 (núcleo) | 11 | 11 | 0 | 0 |
| R2 (+ 3 fora do escopo) | 3 | 3 | 0 | 0 |
| R3/R4 | 7 | 6 | 0 | 1 |
| **Total** | **28** | **26** | **1** | **1** |

**Progresso final: 26 de 27 USs em escopo ativo entregues (96%)** — considerando a US3.5 removida do escopo (28 planejadas − 1 descartada = 27 em escopo ativo). Único item em andamento: US1.6 (recuperação de senha, fora do MVP formal).

### 5.2.5 Desvios Identificados e Ações

1. **Resolvido em 01/07/2026** — todas as issues foram fechadas manualmente (#24, #25, #26, #27, #30, #31, #86, #111, #112, #119), alinhando o rastreamento à entrega real.
2. **Escopo adicional não formalizado no backlog:** US2.12, US2.13 e US2.14 (perfis públicos e vagas salvas) foram desenvolvidas e entregues (issues fechadas), mas seguem **sem entrada correspondente** em `backlog_produto.md`. **Ação pendente:** formalizar no backlog ou justificar formalmente sua origem — este item continua em aberto.
3. **Item fora do MVP formal, em andamento:** US1.6 (Recuperação de Senha, RF05) foi classificada como *Won't Have* na priorização inicial do MVP, mas está sendo desenvolvida (PR #93, ainda aberto). A decisão de antecipar está documentada na própria issue #17, que previa essa possibilidade. **Ação:** nenhuma correção necessária — manter o registro para rastreabilidade até o PR ser mergeado.
4. **Inconsistência de classificação do RF17:** aparece como *Could Have* na tabela de priorização e *Should Have* no texto da seção 10.5 do backlog. A US derivada (US3.7) já foi entregue independente dessa classificação. **Ação pendente:** alinhar a classificação em revisão do documento.
5. **US2.9 entregue por caminho diferente do planejado:** o PR #114 (Henrique Fontenelle) implementava apenas o frontend com dados mockados e foi fechado sem merge — a entrega real da US2.9 veio do PR #130, de forma integrada com outras USs. Não é uma falha, mas vale registrar que o plano inicial de divisão de trabalho (frontend/backend em PRs separados) não foi o que efetivamente gerou a entrega.
6. **Reclassificação de status por decisão de equipe:** US3.4 (Exportação de Certificado em PDF) estava marcada como entrega parcial, já que a issue #32 registrava dois cenários (exportação em lote, visualizador integrado) como planejados/não entregues. Em reunião de equipe (01/07/2026), o time avaliou que a entrega atende ao critério de pronto e reclassificou a US como completa. **Ação recomendada:** atualizar também a descrição da issue #32 no GitHub para refletir essa decisão, evitando divergência entre o cronograma e a issue original.
7. **Dependência real ainda bloqueando entrega:** US3.5 e US3.6 seguem pendentes, com US3.6 formalmente bloqueada por depender de US3.5, que ainda não foi iniciada. É o único bloqueio de dependência real (não apenas formal) que resta no projeto.
8. **Sincronização entre branches `develop` e `main`:** o workflow de deploy do GitHub Pages (`.github/workflows/deploy.yml`) publica exclusivamente a partir da `main`, mas o desenvolvimento ocorre na `develop`. Isso já causou perda de conteúdo real (seção 5.3 — Spike de Infraestrutura — existia apenas na `main` e não constava na `develop` até esta atualização). **Ação:** definir uma rotina de sincronização `develop` → `main` (PR periódico ou merge automatizado) para evitar que o conteúdo publicado fique defasado ou que documentação seja perdida em reescritas futuras.
9. **Remoção de escopo sem registro formal em issue:** US3.5 foi descartada por decisão do líder com aval da equipe, mas a issue #33 no GitHub segue aberta, sem comentário registrando essa decisão. **Ação recomendada:** fechar a issue #33 no GitHub com o motivo do cancelamento, para que a decisão fique rastreável fora deste documento também.

## 5.3 Spike de Infraestrutura e Configuração de Ambiente

> **Nota de recuperação:** esta seção existia na branch `main` (publicada no GitHub Pages) mas havia sido perdida na branch `develop` durante uma reescrita anterior do cronograma. Recuperada e reincorporada nesta atualização (01/07/2026) para preservar a evidência de processo já documentada.

Por tratar-se do primeiro projeto real da equipe com implantação em ambiente de produção em nuvem, o trabalho de infraestrutura revelou-se significativamente maior do que o estimado inicialmente. Esta seção registra formalmente as atividades realizadas como evidência do processo de engenharia executado.

### Motivação

A equipe não possuía experiência prévia com provisionamento de servidores em nuvem, configuração de serviços de sistema operacional ou implantação de aplicações Django em produção. A decisão de usar AWS EC2 + RDS + S3 foi motivada pelo alinhamento com práticas de mercado e pela necessidade de um ambiente de produção real para validação das entregas com o cliente. O custo de aprendizado — pesquisa, tentativa, erro e reconfiguração — só se tornou visível durante a execução, impactando o prazo da R1 em aproximadamente 3 dias.

### Atividades Realizadas

| Atividade | Descrição | Evidência |
| :--- | :--- | :--- |
| Pesquisa e seleção da stack de infraestrutura | Análise comparativa entre Railway, Render e AWS. Escolha do AWS Free Tier por custo zero e aderência ao mercado. | Decisão registrada na seção 2.4 do documento de Visão do Produto. |
| Criação e configuração da conta AWS | Conta criada, alertas de cobrança e budget zero configurados para garantir R$ 0,00 de custo ao longo do semestre. | Console AWS ativo desde 23/05/2026. Créditos: $200 USD. |
| Provisionamento do servidor EC2 | Criação da instância liaison-tutorial-ec2 (t3.micro, Ubuntu 26.04 LTS, us-east-2c). Configuração de Security Groups para portas 22, 80 e 8000. | Instance ID: i-069dee01d436b60ff. IP: 18.225.181.125. |
| Configuração do banco RDS PostgreSQL | Criação do banco liaison-db (PostgreSQL 15, db.t4g.micro). Acesso restrito ao Security Group do EC2. | Endpoint: liaison-db.c9kioi06gfyd.us-east-2.rds.amazonaws.com:5432. |
| Configuração de acesso SSH com chave .pem | Geração do par de chaves liaison-key.pem. Configuração de permissão chmod 400. Acesso seguro ao servidor sem senha. | ssh -i liaison-key.pem ubuntu@18.225.181.125 funcional. |
| Instalação do ambiente Python no servidor | Python 3.14.4 instalado. Ambiente virtual criado. Todas as dependências do requirements.txt instaladas. | python3 --version retorna Python 3.14.4 no servidor EC2. |
| Configuração do Gunicorn como serviço systemd | Gunicorn configurado como serviço liaison.service com reinício automático em caso de falha. | systemctl is-active liaison retorna active. |
| Configuração do Nginx como proxy reverso | Nginx configurado na porta 80, redirecionando requisições para o Gunicorn na porta 8000. | systemctl is-active nginx retorna active. Acessível em http://18.225.181.125. |
| Aplicação das migrations em produção | Migrations do Django executadas no RDS. Esquema do banco criado com tabelas de usuários, perfis e vagas. | Migrations 0001 a 0008 aplicadas. Verificado via showmigrations. |
| Configuração do S3 para armazenamento de arquivos | Bucket liaison-media-2026 criado. Usuário IAM liaison-s3-user com política AmazonS3FullAccess. django-storages e boto3 configurados. | Variáveis USE_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY e AWS_STORAGE_BUCKET_NAME configuradas no .env do servidor. |
| Docker Compose para desenvolvimento local | docker-compose.yml criado com serviços db (PostgreSQL 16) e backend (Django). Garante ambiente idêntico entre todos os desenvolvedores. | Arquivo docker-compose.yml na raiz do repositório. |
| Script de deploy automatizado | deploy.sh criado automatizando os 6 passos de deploy: git pull, ativação do venv, pip install, migrate, collectstatic e systemctl restart. | PR #80 mergeado. Arquivo deploy.sh na raiz do repositório. |
| Documentação técnica de infraestrutura | INFRA.md criado com documentação completa do ambiente de produção: serviços, portas, comandos de acesso e procedimentos de manutenção. | PR #47 mergeado. INFRA.md disponível no repositório e no GitPages. |

## 5.4 Evolução do Progresso ao Longo do Tempo

> Construído a partir das datas reais de `closedAt` (issues fechadas) e `mergedAt` (PRs mergeados), levantadas diretamente do GitHub em 01/07/2026. Itens 🔵 (em andamento) e ❌ (descartados) não entram na contagem de entregas.

### 5.4.1 Progresso por Release

```
R1 — Fundação           █████████░  86%  (6/7)
R2 — Perfis e Conexão    ██████████ 100%  (11/11 do escopo original)
R3 — Gestão e Triagem
R4 — Certificação        █████████░  86%  (6/7, 1 descartada)
──────────────────────────────────────────────
TOTAL (27 USs em escopo ativo)  ██████████  96%  (26/27)
```

### 5.4.2 Linha do Tempo de Entregas Reais

| Data | USs entregues no dia | Cumulativo | % do escopo ativo (27) |
| :--- | :--- | :---: | :---: |
| 31/05/2026 | US1.1 | 1 | 4% |
| 08/06/2026 | US1.2 | 2 | 7% |
| 10/06/2026 | US1.3 | 3 | 11% |
| 14/06/2026 | US1.4, US1.5, US2.1 | 6 | 22% |
| 15/06/2026 | US1.7 | 7 | 26% |
| 29/06/2026 | US2.2, US2.3, US2.4, US2.5, US2.6 | 12 | 44% |
| 30/06/2026 | US2.8, US2.10, US2.11, US3.1, US3.2, US3.3, US3.7 | 19 | 70% |
| 01/07/2026 | US2.7, US2.9, US2.12, US2.13, US2.14, US3.4, US3.6 | 26 | 96% |

```
100% ┤                                                      ●  96%
 90% ┤
 80% ┤
 70% ┤                                              ●  70%
 60% ┤
 50% ┤
 40% ┤                                      ●  44%
 30% ┤
 20% ┤        ●  22%  ●  26%
 10% ┤   ●  7%   ●  11%
  0% ┼───●────────────────────────────────────────────────────
     31/05  08/06 10/06 14/06 15/06        29/06   30/06  01/07
```

### 5.4.3 Planejado vs. Real por Marco de Release

| Release | Data planejada | % entregue na data planejada* | % entregue em 01/07/2026 |
| :--- | :---: | :---: | :---: |
| R1 — Fundação | 26/05/2026 | 0%** | 86% |
| R2 — Perfis e Conexão | 16/06/2026 | 26% | 100% (núcleo) |
| R3 — Gestão e Triagem | 30/06/2026 | 44% | 86% (combinado com R4)*** |
| R4 — Certificação | 14/07/2026 | — (prazo não vencido) | 86% (combinado com R3)*** |

\* Percentual do total de 27 USs em escopo ativo entregues até a data planejada de cada release, não apenas as USs daquela release.
\*\* R1 foi concluída poucos dias após sua data planejada (última entrega de R1 em 15/06); o "0%" reflete que a primeira entrega registrada (US1.1) ocorreu em 31/05, 5 dias após a data-alvo de 26/05.
\*\*\* R3 e R4 são tratadas como um bloco único nesta análise (seção 5.2.3), pois suas USs formam uma cadeia de dependência contínua (triagem → frequência → certificação). O 86% representa 6 de 7 USs combinadas das duas releases (1 descartada), não um cálculo isolado por release.

**Leitura do gráfico:** o ritmo de entregas foi historicamente abaixo do planejado até meados de junho (R1 atrasou ~5 dias; R2 estava em apenas 26% na sua própria data-alvo), mas houve uma concentração muito forte de entregas em 29/06–01/07 — 19 das 26 entregas do escopo ativo (73%) saíram nesses últimos 3 dias antes da conclusão. Isso confirma o desvio já registrado na seção 5.2: o cronograma documentado ficou defasado em relação ao ritmo real, que se acelerou abruptamente perto do prazo de R3/R4 e seguiu se acelerando até a aprovação final deste documento.

