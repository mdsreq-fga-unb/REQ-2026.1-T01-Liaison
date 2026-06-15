
# 5 CRONOGRAMA E ENTREGAS

O projeto adota **KanbanXP** como framework de desenvolvimento. As releases são incrementais e cumulativas — a cada entrega um conjunto coeso de funcionalidades que agregam valor direto ao usuário final. Infraestrutura e configuração de ambiente são incorporadas conforme a necessidade de cada release, nunca concentradas em etapa isolada.

## 5.1 Plano de Releases

| Release | Data | Objetivo | Escopo | Valor Entregue |
| :--- | :--- | :--- | :--- | :--- |
| **R1 — Fundação** | 26/05/2026 | Cadastro e Acesso Seguro | Cadastro de estudantes e organizações. Autenticação com e-mail e senha. Moderação de organizações pelo administrador. Segurança de credenciais. | A plataforma passa a existir: os três perfis de usuário conseguem se cadastrar e acessar com segurança. Apenas organizações legítimas são aprovadas. |
| **R2 — Perfis e Conexão** | 16/06/2026 | Personalização e Descoberta | Gestão de perfis de estudantes e organizações. Visualização de oportunidades. Candidatura e cancelamento de candidatura. | Usuários constroem sua identidade na plataforma. Estudantes descobrem vagas e se candidatam com autonomia. |
| **R3 — Gestão e Triagem** | 30/06/2026 | Ciclo Operacional das Vagas | Criação, edição e cancelamento de vagas pelas organizações. Avaliação de candidatos (aprovar/recusar). Suporte a uso concorrente e mobile. | Organizações gerenciam suas vagas de ponta a ponta. Plataforma responsiva e pronta para escala. |
| **R4 — Certificação** | 14/07/2026 | Fechamento do Ciclo | Listagem de aprovados. Registro de presença e ateste de horas. Emissão automática de certificado digital com hash de validação. | O ciclo do voluntariado se fecha: a organização atesta a participação e o estudante recebe um certificado digital verificável. |

---

## 5.2 Status de Execução

Data de atualização: 14/06/2026. Percentual geral do MVP: **~60%**.

<div class="progress-header">
<span class="progress-label">Progresso geral do MVP</span>
<span><span class="badge badge-green">Em andamento</span> &nbsp; <span class="progress-pct" style="color:#27500A">60%</span></span>
</div>
<div class="progress-wrap"><div class="progress-bar bar-green" style="--pct:60%"></div></div>

<div class="progress-header">
<span class="progress-label">R1 — Fundação | 26/05/2026</span>
<span><span class="badge badge-green">Concluída</span> &nbsp; <span class="progress-pct" style="color:#27500A">100%</span></span>
</div>
<div class="progress-wrap"><div class="progress-bar bar-green" style="--pct:100%"></div></div>

<div class="progress-header">
<span class="progress-label">R2 — Perfis e Conexão | 16/06/2026</span>
<span><span class="badge badge-blue">Em andamento</span> &nbsp; <span class="progress-pct" style="color:#0C447C">60%</span></span>
</div>
<div class="progress-wrap"><div class="progress-bar bar-blue" style="--pct:60%"></div></div>

<div class="progress-header">
<span class="progress-label">R3 — Gestão e Triagem | 30/06/2026</span>
<span><span class="badge badge-amber">Planejada</span> &nbsp; <span class="progress-pct" style="color:#633806">5%</span></span>
</div>
<div class="progress-wrap"><div class="progress-bar bar-amber" style="--pct:5%"></div></div>

<div class="progress-header">
<span class="progress-label">R4 — Certificação | 14/07/2026</span>
<span><span class="badge badge-gray">Planejada</span> &nbsp; <span class="progress-pct" style="color:#5F5E5A">0%</span></span>
</div>
<div class="progress-wrap"><div class="progress-bar bar-gray" style="--pct:0%"></div></div>

---

**Legenda:**
- Entregue — história implementada e validada
- Em andamento — em desenvolvimento ou revisão
- Planejado — ainda não iniciado

### R1 — Fundação | Prazo: 26/05/2026 | Status: Concluída

| História de Usuário | Descrição | Status |
| :--- | :--- | :---: |
| US1.1 | Como estudante, desejo me cadastrar na plataforma | Entregue |
| US1.2 | Como organização, desejo cadastrar minha organização | Entregue |
| US1.3 | Como usuário, desejo fazer login de forma segura | Entregue |
| US1.7 | Como administrador, desejo moderar cadastros de organizações | Entregue |

---

### R2 — Perfis e Conexão | Prazo: 16/06/2026 | Status: Em andamento

| História de Usuário | Descrição | Status |
| :--- | :--- | :---: |
| US1.4 | Como estudante, desejo gerenciar meu perfil | Em andamento |
| US1.5 | Como organização, desejo editar meu perfil institucional | Entregue |
| US2.1 | Como organização, desejo criar vagas de voluntariado | Entregue |
| US2.2 | Como organização, desejo editar vagas existentes | Em andamento |
| US2.3 | Como organização, desejo publicar vagas | Em andamento |
| US2.5 | Como estudante, desejo buscar e filtrar vagas | Planejado |
| US2.6 | Como estudante, desejo visualizar detalhes de uma vaga | Planejado |
| US2.7 | Como estudante, desejo me candidatar a uma vaga | Planejado |
| US2.9 | Como estudante, desejo cancelar minha candidatura | Planejado |

---

### R3 — Gestão e Triagem | Prazo: 30/06/2026 | Status: Planejada

| História de Usuário | Descrição | Status |
| :--- | :--- | :---: |
| US2.4 | Como organização, desejo encerrar vagas | Planejado |
| US2.8 | Como organização, desejo avaliar candidaturas | Planejado |
| US2.10 | Como usuário, desejo receber notificações de candidatura | Planejado |

---

### R4 — Certificação | Prazo: 14/07/2026 | Status: Planejada

| História de Usuário | Descrição | Status |
| :--- | :--- | :---: |
| US3.1 | Como organização, desejo listar estudantes aprovados | Planejado |
| US3.2 | Como organização, desejo registrar frequência e horas | Planejado |
| US3.3 | Como estudante, desejo receber certificado digital em PDF | Planejado |
| US3.5 | Como estudante, desejo visualizar meu histórico de horas | Planejado |
| US3.6 | Como estudante, desejo fazer download dos meus certificados | Planejado |
| US3.7 | Como qualquer pessoa, desejo validar um certificado por URL | Planejado |

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
CRONOGRAMA