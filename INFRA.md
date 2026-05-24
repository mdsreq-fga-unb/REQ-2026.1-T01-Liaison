# Infraestrutura — Projeto Liaison

> Documento técnico do ambiente de produção do Liaison na AWS.  
> **Não commite credenciais reais neste arquivo.**  
> Credenciais de acesso estão sob custódia do Analista de Requisitos (@HenriqueFontenelle).

---

## Arquitetura

```
[Expo Go / APK]
      │
      ▼ HTTP
[EC2 t3.micro — Ubuntu 26.04]
  └── Nginx (porta 80) → Gunicorn (porta 8000) → Django 5.0.14
      │
      ▼ PostgreSQL (porta 5432)
[RDS db.t4g.micro — PostgreSQL 15]
```

| Componente | Serviço AWS | Especificação |
|---|---|---|
| Backend Django | EC2 t3.micro | Ubuntu 26.04 LTS — us-east-2c |
| Banco de dados | RDS db.t4g.micro | PostgreSQL 15 — us-east-2a |
| Proxy reverso | Nginx | Porta 80 — arquivos estáticos |
| Servidor WSGI | Gunicorn | Porta 8000 — 2 workers |

---

## URLs de Acesso

| Ambiente | URL |
|---|---|
| Admin Django | `http://18.225.181.125/admin/` |
| API (base) | `http://18.225.181.125/api/` |

> ⚠️ Acesso via redes residenciais e móveis. Redes corporativas podem bloquear a porta 8000 — usar a porta 80 via Nginx.

---

## Variáveis de Ambiente

O servidor utiliza um arquivo `.env` localizado em `~/liaison/backend/.env`.  
**Nunca commite este arquivo.** Ele já está no `.gitignore`.

As variáveis necessárias são:

```env
DEBUG=False
SECRET_KEY=<chave-secreta-django>
ALLOWED_HOSTS=<ip-do-servidor>,localhost,127.0.0.1
DATABASE_URL=postgres://<usuario>:<senha>@<endpoint-rds>:5432/<nome-banco>
LOCAL_IP=<ip-do-servidor>
```

Solicitar os valores reais ao @HenriqueFontenelle.

---

## Como Conectar ao Servidor

### Via AWS Console (recomendado)
1. Acesse o console AWS → EC2 → Instances
2. Selecione `liaison-tutorial-ec2`
3. Clique em **Connect** → **EC2 Instance Connect** → **Connect**

### Via SSH (terminal)
```bash
ssh -i liaison-key.pem ubuntu@18.225.181.125
```

> A chave `liaison-key.pem` está sob custódia do @HenriqueFontenelle.  
> Permissão necessária: `chmod 400 liaison-key.pem`

---

## Como Atualizar o Código em Produção

Após merge aprovado na branch `develop`, conectar ao servidor e executar:

```bash
cd ~/liaison/backend
git pull origin develop
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
sudo systemctl restart liaison
```

Verificar se o serviço subiu corretamente:

```bash
sudo systemctl status liaison
```

---

## Serviços do Sistema

| Serviço | Comando | Descrição |
|---|---|---|
| Gunicorn (Django) | `sudo systemctl status liaison` | Backend da API |
| Nginx | `sudo systemctl status nginx` | Proxy reverso |

Ambos os serviços são iniciados automaticamente com o servidor.

---

## Estrutura de Diretórios no Servidor

```
/home/ubuntu/liaison/
├── backend/
│   ├── .env                  ← variáveis de ambiente (não versionado)
│   ├── venv/                 ← ambiente virtual Python
│   ├── staticfiles/          ← arquivos estáticos coletados
│   ├── config/               ← configurações Django
│   ├── users/                ← app de usuários
│   ├── applications/         ← app de candidaturas
│   ├── opportunities/        ← app de vagas
│   ├── certificates/         ← app de certificados
│   ├── manage.py
│   └── requirements.txt
└── docs/                     ← documentação MkDocs
```

---

## Configurações do Expo (Frontend Mobile)

Para apontar o Expo para o backend em produção, configure o `.env` do frontend:

```env
LOCAL_IP=18.225.181.125
```

Ou diretamente na URL base da API:

```
http://18.225.181.125/api/
```

---

## Segurança — Security Groups

| Porta | Protocolo | Origem | Finalidade |
|---|---|---|---|
| 22 | TCP | 0.0.0.0/0 | SSH — administração |
| 80 | TCP | 0.0.0.0/0 | HTTP — acesso público via Nginx |
| 8000 | TCP | 0.0.0.0/0 | Gunicorn — acesso direto |
| 5432 | TCP | Security Group EC2 | PostgreSQL — EC2 → RDS |

---
## Gerenciamento de Usuários no Servidor

Os usuários do sistema são criados via terminal no servidor, não pelo admin Django.
Isso se deve a uma incompatibilidade temporária entre Django 5.0.14 e Python 3.14 (ver issue #49).

### Criar novo usuário superadmin

```bash
cd ~/liaison/backend
source venv/bin/activate
python manage.py createsuperuser
```

### Usuários criados em 23/05/2026

| Membro | Email | Papel | Superuser |
|---|---|---|---|
| Henrique Fontenelle | fontenelle.dec@gmail.com | Analista de Requisitos | Sim |
| Gustavo Cintra | cintra.gustavo@hotmail.com | Líder | Sim |
| Luís Monteiro | monteiro.luis@aluno.unb.br | Backend | Sim |
| Pedro Vargas | pedrofvargas10@gmail.com | Frontend | Sim |
| Danilo Barros | danilosarmentobarros@gmail.com | QA | Sim |
| Nicole Fernandes | nicolejovitafernandes@gmail.com | Frontend | Sim |

### Resetar senha de um usuário

```bash
python manage.py changepassword email@dominio.com
```
---


## Checklist de Encerramento (Fim do Semestre)

Executar **obrigatoriamente** ao final do projeto para garantir $0 de cobrança:

- [ ] Terminar instância EC2 → EC2 → Instances → Instance State → **Terminate**
- [ ] Deletar RDS `liaison-db` → RDS → Databases → **Delete** (sem snapshot final)
- [ ] Verificar $0,00 em Billing → Cost Explorer
- [ ] Encerrar conta AWS → Account Settings → **Close Account**

> ⏰ Colocar lembrete com 2 semanas de antecedência ao prazo final.

---

## Responsáveis

| Papel | Responsável |
|---|---|
| Configuração e custódia das credenciais | @HenriqueFontenelle |
| Revisão e aprovação de infraestrutura | @gccintra @Borges061 @Pedrovargas10 |

---

*Última atualização: 23/05/2026 — @HenriqueFontenelle*
