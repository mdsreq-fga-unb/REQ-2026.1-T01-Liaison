# 5 CRONOGRAMA E ENTREGAS

O projeto adota **KanbanXP** como framework de desenvolvimento. As releases são incrementais e cumulativas — cada uma entrega um conjunto coeso de funcionalidades que agregam valor direto ao usuário final. Infraestrutura e configuração de ambiente são incorporadas conforme a necessidade de cada release, nunca concentradas em etapa isolada.

## 5.1 Plano de Releases

| Release | Data | Objetivo | Escopo | Valor Entregue |
| :--- | :--- | :--- | :--- | :--- |
| **R1 — Fundação** | 26/05/2026 | Cadastro e Acesso Seguro | Cadastro de estudantes e organizações. Autenticação com e-mail e senha. Moderação de organizações pelo administrador. Segurança de credenciais. | A plataforma passa a existir: os três perfis de usuário conseguem se cadastrar e acessar com segurança. Apenas organizações legítimas são aprovadas. |
| **R2 — Perfis e Conexão** | 16/06/2026 | Personalização e Descoberta | Gestão de perfis de estudantes e organizações. Visualização de oportunidades. Candidatura e cancelamento de candidatura. | Usuários constroem sua identidade na plataforma. Estudantes descobrem vagas e se candidatam com autonomia. |
| **R3 — Gestão e Triagem** | 30/06/2026 | Ciclo Operacional das Vagas | Criação, edição e cancelamento de vagas pelas organizações. Avaliação de candidatos (aprovar/recusar). Suporte a uso concorrente e mobile. | Organizações gerenciam suas vagas de ponta a ponta. Plataforma responsiva e pronta para escala. |
| **R4 — Certificação** | 14/07/2026 | Fechamento do Ciclo | Listagem de aprovados. Registro de presença e ateste de horas. Emissão automática de certificado digital com hash de validação. | O ciclo do voluntariado se fecha: a organização atesta a participação e o estudante recebe um certificado digital verificável. |

## 5.2 Execução Real por User Story

> **Última atualização:** 01/07/2026
> **Método de levantamento:** cruzamento entre `gh issue list`, `gh pr list --json closingIssuesReferences` (vínculo oficial PR→issue) e o backlog formal (`backlog_produto.md`), executado nesta data. Não é uma estimativa — cada status abaixo tem evidência de código (PR) ou ausência dela verificada diretamente no repositório.

**Legenda de status:**

| Símbolo | Significado |
| :---: | :--- |
| ✅ | Entregue — código mergeado na `develop` e issue fechada |
| 🟡 | Código entregue (PR mergeado), mas issue permanece aberta — pendência de *housekeeping*, não de desenvolvimento |
| 🔵 | Em andamento — PR aberto, ainda não mergeado |
| ⚪ | Pendente — sem PR aberto até o momento |

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
| **US2.8** | Avaliação de Candidaturas pela Organização (RF11) | 🟡 | [PR #118](../../../pull/118), [PR #125](../../../pull/125) | Código mergeado; issue #24 será fechada manualmente. |
| **US2.9** | Cancelamento de Candidatura (RF12) | 🔵 | [PR #114](../../../pull/114) (aberto) | **Justificativa documentada no próprio PR:** frontend completo e funcional (lista de candidaturas, badge de status, modal de confirmação, regra de exibição do botão "Cancelar" apenas em candidaturas pendentes), porém com dados mockados. Falta a integração com a API real de listagem (`getMyApplications`, do PR #113) e com o endpoint de cancelamento (`PATCH /api/v1/applications/{id}/cancel/`). Responsabilidade: Henrique Fontenelle (frontend, concluído) e Gustavo Cintra (integração backend, review solicitada no PR). |
| **US2.10** | Notificações de Status de Candidatura (RF12) | 🟡 | [PR #120](../../../pull/120), [PR #122](../../../pull/122) | Código mergeado; issue #25 será fechada manualmente. |
| **US2.11** | Acompanhamento de Minhas Candidaturas (RF12) | 🟡 | [PR #117](../../../pull/117), [PR #124](../../../pull/124) | Código mergeado; issue #86 será fechada manualmente. |

**R2: 10 de 11 USs do escopo original entregues ou com código mergeado (91%). 1 em andamento.**

> **Desvio de escopo — USs adicionais não rastreadas no backlog:** durante a execução, foram criadas e implementadas três USs que **não constam na tabela oficial do backlog** (`backlog_produto.md`, seção 10.1): perfis públicos de estudante e organização, e listagem de vagas salvas. Estão documentadas abaixo para transparência, mas recomenda-se formalizar sua inclusão no backlog em revisão futura.

| US (issue) | Descrição | Status | Evidência | Observações |
| :--- | :--- | :---: | :--- | :--- |
| US2.12 (#111) | Ver Perfil da Organização | 🟡 | [PR #121](../../../pull/121), [PR #130](../../../pull/130) | Código mergeado; issue #111 será fechada manualmente. |
| US2.13 (#119) | Ver Perfil do Estudante | 🟡 | [PR #121](../../../pull/121), [PR #130](../../../pull/130) | Código mergeado; issue #119 será fechada manualmente. |
| US2.14 (#112) | Listar Oportunidades Salvas | 🟡 | [PR #130](../../../pull/130) | Código mergeado (confirmado via `closingIssuesReferences` do PR #130, que também fecha #111 e #119); issue #112 será fechada manualmente. |

### 5.2.3 R3 — Gestão e Triagem / R4 — Certificação

| US | Descrição | Status | Evidência | Observações |
| :--- | :--- | :---: | :--- | :--- |
| **US3.1** | Listagem de Estudantes Aprovados (RF13) | 🟡 | [PR #126](../../../pull/126) | Código mergeado; issue #26 será fechada manualmente. |
| **US3.2** | Registro de Frequência e Carga Horária (RF14) | 🟡 | [PR #126](../../../pull/126) | Código mergeado; issue #27 será fechada manualmente. |
| **US3.3** | Geração Automática de Certificado Digital (RF15) | 🟡 | [PR #116](../../../pull/116) | Código mergeado; issue #31 será fechada manualmente. Issues #28/#29 (antigas, duplicadas) já estavam fechadas com label `duplicate`. |
| **US3.4** | Exportação de Certificado em PDF (RF15) | ⚪ | — | **Bloqueada por dependência declarada:** issue #32 lista como pré-requisito formal a US3.3 (#31 — Geração de Certificado). A dependência já está tecnicamente satisfeita no código (PR #116, mergeado), mas a issue #32 não teve desenvolvimento próprio iniciado até o momento — não há PR aberto especificamente para esta US. |
| **US3.5** | Visualização de Histórico de Horas (RF16) | ⚪ | — | **Bloqueada por dependência declarada:** issue #33 lista como pré-requisitos a US3.2 (#27 — Registro de Frequência) e a US3.3 (#31 — Geração de Certificado). Ambas já têm código entregue (PR #126 e #116), mas o desenvolvimento específico da tela de histórico ainda não foi iniciado. |
| **US3.6** | Download de Certificados (RF16) | ⚪ | — | **Bloqueada por dependência declarada:** issue #34 lista como pré-requisito a US3.5 (#33 — Histórico de Horas), que ainda não foi iniciada (ver acima). Este é o único item da cadeia com bloqueio real e não apenas formal — não há como iniciar antes de #33. |
| **US3.7** | Portal Público de Validação de Certificados (RF17) | 🟡 | [PR #116](../../../pull/116) | Código mergeado; issue #30 será fechada manualmente. **Nota de rastreabilidade:** há inconsistência no backlog — o RF17 aparece como *Could Have* na tabela de priorização (10.2.2) mas como *Should Have* no texto da seção 10.5; recomenda-se alinhar. |

**R3/R4: 4 de 7 USs com código entregue (57%). 3 pendentes sem PR próprio (uma delas — US3.6 — com bloqueio real de dependência).**

### 5.2.4 Consolidado Geral

| Release | Planejadas | Entregues (✅) | Código entregue, issue pendente (🟡) | Em andamento (🔵) | Pendentes (⚪) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| R1 | 7 | 6 | 0 | 1 | 0 |
| R2 (núcleo) | 11 | 7 | 3 | 1 | 0 |
| R2 (+ 3 fora do escopo) | 3 | 0 | 3 | 0 | 0 |
| R3/R4 | 7 | 0 | 4 | 0 | 3 |
| **Total** | **28** | **13** | **10** | **2** | **3** |

**Progresso real estimado: 23 de 28 USs (82%) têm código entregue (✅ ou 🟡) na `develop`**, um avanço em relação à conferência anterior (79%), após confirmação de que a US2.14 também está coberta pelo PR #130. Isso reforça o achado de que a defasagem entre issue tracking e código real (item 1 dos desvios abaixo) é mais ampla do que o GitHub Issues sozinho revela — vale conferir `closingIssuesReferences` de cada PR por completo, não apenas os números esperados.

### 5.2.5 Desvios Identificados e Ações

1. **Defasagem entre issue tracking e código real:** 10 USs têm PR mergeado na `develop` com a issue correspondente ainda aberta (🟡). Causa provável: merges que não passaram por squash com referência automática de fechamento, ou push direto sem a keyword `Closes #X`. **Ação:** fechar manualmente as issues #24, #25, #26, #27, #30, #31, #86, #111, #112, #119.
2. **Escopo adicional não formalizado no backlog:** US2.12, US2.13 e US2.14 (perfis públicos e vagas salvas) foram desenvolvidas sem entrada correspondente em `backlog_produto.md`. **Ação:** formalizar no backlog ou justificar formalmente sua origem.
3. **Antecipação de item *Won't Have*:** US1.6 (Recuperação de Senha, RF05) foi descartada do MVP na priorização inicial, mas está sendo desenvolvida (PR #93 aberto). A decisão está documentada na própria issue #17, que previa essa possibilidade. **Ação:** nenhuma correção necessária — apenas manter o registro para rastreabilidade.
4. **Inconsistência de classificação do RF17:** aparece como *Could Have* na tabela de priorização e *Should Have* no texto da seção 10.5 do backlog. **Ação:** alinhar a classificação em revisão do documento.
5. **Item em andamento com divisão de responsabilidade clara:** US2.9 (Cancelamento de Candidatura) tem o frontend concluído por Henrique Fontenelle (PR #114), aguardando integração com a API real por Gustavo Cintra (review já solicitada no PR).
6. **Cadeia de dependência formalmente bloqueando entregas em R3/R4:** US3.4, US3.5 e US3.6 declaram dependências entre si e com US3.2/US3.3. As dependências de código (PR #126, #116) já estão satisfeitas, mas o desenvolvimento específico dessas três USs ainda não foi iniciado — US3.6 é a mais crítica, pois depende diretamente de US3.5, que também não foi iniciada.
7. **Sincronização entre branches `develop` e `main`:** o workflow de deploy do GitHub Pages (`.github/workflows/deploy.yml`) publica exclusivamente a partir da `main`, mas o desenvolvimento ocorre na `develop`. Isso já causou perda de conteúdo real (seção 5.3 — Spike de Infraestrutura — existia apenas na `main` e não constava na `develop` até esta atualização). **Ação:** definir uma rotina de sincronização `develop` → `main` (PR periódico ou merge automatizado) para evitar que o conteúdo publicado fique defasado ou que documentação seja perdida em reescritas futuras.

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

> Construído a partir das datas reais de `closedAt` (issues fechadas) e `mergedAt` (PRs mergeados que entregam código de USs ainda com issue aberta), levantadas diretamente do GitHub em 01/07/2026. Itens 🔵 (em andamento) e ⚪ (pendentes) não entram na contagem — a data usada é a da entrega efetiva do código.

### 5.4.1 Progresso por Release

```
R1 — Fundação           █████████░  86%  (6/7)
R2 — Perfis e Conexão    █████████░  91%  (10/11 do escopo original)
R3 — Gestão e Triagem
R4 — Certificação        ██████░░░░  57%  (4/7)
──────────────────────────────────────────────
TOTAL (28 USs)           ████████░░  82%  (23/28)
```

### 5.4.2 Linha do Tempo de Entregas Reais

| Data | USs entregues no dia | Cumulativo | % do total (28) |
| :--- | :--- | :---: | :---: |
| 31/05/2026 | US1.1 | 1 | 4% |
| 08/06/2026 | US1.2 | 2 | 7% |
| 10/06/2026 | US1.3 | 3 | 11% |
| 14/06/2026 | US1.4, US1.5, US2.1 | 6 | 21% |
| 15/06/2026 | US1.7 | 7 | 25% |
| 29/06/2026 | US2.2, US2.3, US2.4, US2.5, US2.6 | 12 | 43% |
| 30/06/2026 | US2.8, US2.10, US2.11, US3.1, US3.2, US3.3, US3.7 | 19 | 68% |
| 01/07/2026 | US2.7, US2.12, US2.13, US2.14 | 23 | 82% |

```
100% ┤
 90% ┤
 80% ┤                                                      ●  82%
 70% ┤                                              ●  68%
 60% ┤
 50% ┤
 40% ┤                                      ●  43%
 30% ┤
 20% ┤        ●  21%  ●  25%
 10% ┤   ●  7%   ●  11%
  0% ┼───●────────────────────────────────────────────────────
     31/05  08/06 10/06 14/06 15/06        29/06   30/06  01/07
```

### 5.4.3 Planejado vs. Real por Marco de Release

| Release | Data planejada | % entregue na data planejada* | % entregue em 01/07/2026 |
| :--- | :---: | :---: | :---: |
| R1 — Fundação | 26/05/2026 | 0%** | 86% |
| R2 — Perfis e Conexão | 16/06/2026 | 25% | 91% (núcleo) |
| R3 — Gestão e Triagem | 30/06/2026 | 43% | 57% (combinado com R4)*** |
| R4 — Certificação | 14/07/2026 | — (prazo não vencido) | 57% (combinado com R3)*** |

\* Percentual do total de 28 USs entregues até a data planejada de cada release, não apenas as USs daquela release.
\*\* R1 foi concluída poucos dias após sua data planejada (última entrega de R1 em 15/06); o "0%" reflete que a primeira entrega registrada (US1.1) ocorreu em 31/05, 5 dias após a data-alvo de 26/05.
\*\*\* R3 e R4 são tratadas como um bloco único nesta análise (seção 5.2.3), pois suas USs formam uma cadeia de dependência contínua (triagem → frequência → certificação). O 57% representa 4 de 7 USs combinadas das duas releases, não um cálculo isolado por release.

**Leitura do gráfico:** o ritmo de entregas foi historicamente abaixo do planejado até meados de junho (R1 atrasou ~5 dias; R2 estava em apenas 25% na sua própria data-alvo), mas houve uma concentração muito forte de entregas em 29-30/06 e 01/07 — 17 das 23 USs entregues (74% de tudo que foi entregue) saíram nos últimos 3 dias antes desta atualização. Isso confirma o desvio já registrado na seção 5.2: o cronograma documentado ficou defasado em relação ao ritmo real, que se acelerou abruptamente perto do prazo de R3/R4.

