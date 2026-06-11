# 5 CRONOGRAMA E ENTREGAS

O projeto adota **KanbanXP** como framework de desenvolvimento. As releases são incrementais e cumulativas — cada uma entrega um conjunto coeso de funcionalidades que agregam valor direto ao usuário final. Infraestrutura e configuração de ambiente são incorporadas conforme a necessidade de cada release, nunca concentradas em etapa isolada.

## 5.1 Plano de Releases

| Release | Data | Objetivo | Escopo | Valor Entregue |
| :--- | :--- | :--- | :--- | :--- |
| **R1 — Fundação** | 26/05/2026 | Cadastro e Acesso Seguro | Cadastro de estudantes e organizações. Autenticação com e-mail e senha. Moderação de organizações pelo administrador. Segurança de credenciais. | A plataforma passa a existir: os três perfis de usuário conseguem se cadastrar e acessar com segurança. Apenas organizações legítimas são aprovadas. |
| **R2 — Perfis e Conexão** | 16/06/2026 | Personalização e Descoberta | Gestão de perfis de estudantes e organizações. Visualização de oportunidades. Candidatura e cancelamento de candidatura. | Usuários constroem sua identidade na plataforma. Estudantes descobrem vagas e se candidatam com autonomia. |
| **R3 — Gestão e Triagem** | 30/06/2026 | Ciclo Operacional das Vagas | Criação, edição e cancelamento de vagas pelas organizações. Avaliação de candidatos (aprovar/recusar). Suporte a uso concorrente e mobile. | Organizações gerenciam suas vagas de ponta a ponta. Plataforma responsiva e pronta para escala. |
| **R4 — Certificação** | 14/07/2026 | Fechamento do Ciclo | Listagem de aprovados. Registro de presença e ateste de horas. Emissão automática de certificado digital com hash de validação. | O ciclo do voluntariado se fecha: a organização atesta a participação e o estudante recebe um certificado digital verificável. |

---

## 5.2 Status de Execução

Data de atualização: 11/06/2026. Percentual geral do MVP: **~52%**.

**Legenda de status:**
- ✅ **Em produção** — deployado e acessível em `http://18.225.181.125`
- 📦 **Implementado** — no repositório GitHub, testado, aguardando deploy
- 🔄 **Em andamento** — PR aberto, revisão pendente
- ⏳ **Planejado** — não iniciado

### R1 — Fundação | Prazo: 26/05/2026 | Status: ✅ Concluída (entregue com atraso de 3 dias)

| Item | Status | Evidência |
| :--- | :---: | :--- |
| Cadastro de estudante — RF01 | ✅ Em produção | PR #55 mergeado em 29/05/2026. Endpoint `POST /api/v1/auth/register/student/` ativo. Cria User + StudentProfile atomicamente com `@transaction.atomic`. |
| Autenticação JWT — RF03 | ✅ Em produção | Endpoints `POST /api/v1/auth/token/` e `/token/refresh/` ativos. SimpleJWT configurado. |
| Segurança de credenciais — RNF01 | ✅ Em produção | bcrypt via `django.contrib.auth`. Senhas nunca armazenadas em texto plano. |
| Validação de CNPJ — RNF03 | ✅ Em produção | Função `validar_cnpj()` com algoritmo oficial dos dígitos verificadores da Receita Federal implementada em `users/models.py`. |
| IDs com UUID — RNF09 | ✅ Em produção | `User.id = UUIDField(primary_key=True, default=uuid.uuid4)`. |
| Frontend — tela de login | ✅ Implementado | `LoginScreen.tsx` com tabs estudante/organização, campos email/senha, logo SVG, integrado ao backend real via `apiUrl()`. |
| Frontend — fluxo de registro (4 etapas) | ✅ Implementado | `RegisterScreen.tsx` com Step1RoleSelect, Step2PersonalData, Step3Academic, Step4Interests. Todos com testes. |
| Frontend — navegação por perfil | ✅ Implementado | `RootNavigator`, `AuthStack`, `StudentStack`, `OrgStack`, `AdminStack` implementados. |
| Frontend — componentes UI | ✅ Em produção | Button, Checkbox, Input, PasswordStrengthIndicator, ProgressBar, RadioCard, Select — todos com testes. |
| Frontend — utilitários | 📦 Implementado | `utils/errors.ts`, `utils/formatters.ts`, `utils/validators.ts` — funções de formatação e validação reutilizáveis. Aguardando deploy. |
| Testes backend | ✅ Implementado | 5 arquivos: `test_models.py`, `test_serializers.py`, `test_validators.py`, `test_views.py`, `test_crud.py`. |

**Percentual da R1: 95%** *(migrations 0003 e 0004 pendentes de aplicação no servidor)*

---

### R2 — Perfis e Conexão | Prazo: 16/06/2026 | Status: 🔄 Em andamento

| Item | Status | Evidência |
| :--- | :---: | :--- |
| Gestão de perfil do estudante — RF04 | 🔄 Em andamento | PR #65 aberto. `StudentProfile` com 11 campos implementado e testado no backend. |
| Gestão de perfil da organização — RF04 | 🔄 Em andamento | PR #66 aberto. Model `User` com CNPJ, endereço e role `organizacao`. Migration 0002 aplicada. |
| Frontend — registro de organização (RF02) | 📦 Implementado | `Step2OrgData.tsx` e `Step3OrgConfirmation.tsx` implementados com testes. Fluxo completo de cadastro de organização no frontend. Aguardando deploy. |
| Persistência de tokens JWT | 🔄 Em andamento | PR #64 aberto. Fluxo completo de login com refresh token. |
| Check de email e matrícula | ✅ Em produção | Endpoints `POST /api/v1/auth/check-email/` e `/check-matricula/` ativos. Integrados ao frontend no Step2. |
| Frontend — home do estudante | 🔄 Parcial | `screens/student/HomeScreen.tsx` estruturado. Conteúdo dinâmico depende das APIs de vagas. |
| Frontend — home da organização | 🔄 Parcial | `screens/organization/HomeScreen.tsx` estruturado. Conteúdo dinâmico depende das APIs de vagas. |
| Frontend — home do admin | 🔄 Parcial | `screens/admin/HomeScreen.tsx` estruturado. |
| Visualização de oportunidades — RF09 | ⏳ Aguardando | App `opportunities/` criado como placeholder. Backend a implementar. |
| Candidatura — RF10 | ⏳ Aguardando | App `applications/` criado como placeholder. Backend a implementar. |
| Cancelamento de candidatura — RF12 | ⏳ Aguardando | Dependente de RF10. |

**Percentual da R2: 55%** *(prazo: 16/06/2026 — 5 dias restantes)*

---

### R3 — Gestão e Triagem | Prazo: 30/06/2026 | Status: ⏳ Planejada

| Item | Status |
| :--- | :---: |
| Criar vagas — RF18 | ⏳ App estruturado, implementação pendente |
| Editar vagas — RF19 | ⏳ Pendente |
| Publicar vagas — RF20 | ⏳ Pendente |
| Encerrar vagas — RF21 | ⏳ Pendente |
| Busca e filtro de vagas — RF08 | ⏳ Pendente |
| Avaliação de candidaturas — RF11 | ⏳ Pendente |
| Interface responsiva mobile — RNF04 | ⏳ Parcial (componentes UI responsivos, telas de vagas pendentes) |
| Suporte a 1.000 usuários — RNF06 | ⏳ Pendente (testes de carga) |

**Percentual da R3: 5%** *(estrutura dos apps criada)*

---

### R4 — Certificação | Prazo: 14/07/2026 | Status: ⏳ Planejada

| Item | Status |
| :--- | :---: |
| Listagem de aprovados — RF13 | ⏳ App `certificates/` estruturado |
| Registro de frequência — RF14 | ⏳ Pendente |
| Emissão de certificado PDF — RF15 | ⏳ Pendente |
| Consulta de histórico — RF16 | ⏳ Pendente |
| Geração assíncrona PDF — RNF07 | ⏳ Pendente (Celery + Redis a configurar) |
| Imutabilidade de registros — RNF08 | ⏳ Pendente |

**Percentual da R4: 0%** *(planejada)*

---

## 5.3 Spike de Infraestrutura e Configuração de Ambiente

Por tratar-se do primeiro projeto real da equipe com implantação em ambiente de produção em nuvem, o trabalho de infraestrutura revelou-se significativamente maior do que o estimado inicialmente. Esta seção registra formalmente as atividades realizadas como evidência do processo de engenharia executado.

### Motivação

A equipe não possuía experiência prévia com provisionamento de servidores em nuvem, configuração de serviços de sistema operacional ou implantação de aplicações Django em produção. A decisão de usar AWS EC2 + RDS + S3 foi motivada pelo alinhamento com práticas de mercado e pela necessidade de um ambiente de produção real para validação das entregas com o cliente. O custo de aprendizado — pesquisa, tentativa, erro e reconfiguração — só se tornou visível durante a execução, impactando o prazo da R1 em aproximadamente 3 dias.

### Atividades Realizadas

| Atividade | Descrição | Evidência |
| :--- | :--- | :--- |
| Pesquisa e seleção da stack de infraestrutura | Análise comparativa entre Railway, Render e AWS. Escolha do AWS Free Tier por custo zero e aderência ao mercado. | Decisão registrada na seção 2.4 do documento de Visão do Produto. |
| Criação e configuração da conta AWS | Conta criada, alertas de cobrança e budget zero configurados para garantir R$ 0,00 de custo ao longo do semestre. | Console AWS ativo desde 23/05/2026. Créditos: $200 USD. |
| Provisionamento do servidor EC2 | Criação da instância `liaison-tutorial-ec2` (t3.micro, Ubuntu 26.04 LTS, us-east-2c). Configuração de Security Groups para portas 22 (SSH), 80 (HTTP) e 8000 (Gunicorn). | Instance ID: `i-069dee01d436b60ff`. IP: `18.225.181.125`. |
| Configuração do banco RDS PostgreSQL | Criação do banco `liaison-db` (PostgreSQL 15, db.t4g.micro). Acesso restrito ao Security Group do EC2. | Endpoint: `liaison-db.c9kioi06gfyd.us-east-2.rds.amazonaws.com:5432`. |
| Configuração de acesso SSH com chave .pem | Geração do par de chaves `liaison-key.pem`. Configuração de permissão `chmod 400`. Acesso seguro ao servidor sem senha. | `ssh -i liaison-key.pem ubuntu@18.225.181.125` funcional. |
| Instalação do ambiente Python no servidor | Python 3.14.4 instalado. Ambiente virtual criado. Todas as dependências do `requirements.txt` instaladas. | `python3 --version` → Python 3.14.4 no servidor EC2. |
| Configuração do Gunicorn como serviço systemd | Gunicorn configurado como serviço `liaison.service` com reinício automático em caso de falha. | `systemctl is-active liaison` → active. |
| Configuração do Nginx como proxy reverso | Nginx configurado na porta 80, redirecionando requisições para o Gunicorn na porta 8000. Arquivos estáticos servidos diretamente pelo Nginx. | `systemctl is-active nginx` → active. Acessível em `http://18.225.181.125`. |
| Aplicação das migrations iniciais | Migrations do Django executadas no RDS. Esquema do banco criado com tabelas de usuários, perfis e controle de acesso. | Migrations 0001 e 0002 do app `users` aplicadas. Verificado via `showmigrations`. |
| Configuração do S3 para armazenamento de arquivos | Bucket `liaison-media-2026` criado. Usuário IAM `liaison-s3-user` com política `AmazonS3FullAccess`. `django-storages` e `boto3` configurados no backend. | Variáveis `USE_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME` configuradas no `.env` do servidor. |
| Docker Compose para desenvolvimento local | `docker-compose.yml` criado com serviços `db` (PostgreSQL 16) e `backend` (Django). Garante ambiente idêntico entre todos os desenvolvedores da equipe. | Arquivo `docker-compose.yml` na raiz do repositório. |
| Script de deploy automatizado | `deploy.sh` criado automatizando os 6 passos de deploy: `git pull`, ativação do venv, `pip install`, `migrate`, `collectstatic` e `systemctl restart`. | PR #80 — arquivo `deploy.sh` na raiz do repositório. |
| Documentação técnica de infraestrutura | `INFRA.md` criado com documentação completa do ambiente de produção: serviços, portas, comandos de acesso e procedimentos de manutenção. | PR #47 — `docs/projeto/INFRA.md` no repositório. |
