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
  └── Nginx (porta 80) → Gunicorn (porta 8000) → Django 5.2.15
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

> Variáveis adicionais do armazenamento de mídia (S3) estão documentadas na seção **Armazenamento de Mídia (Amazon S3)**.

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

## Armazenamento de Mídia (Amazon S3)

Arquivos enviados por usuários (fotos de perfil, comprovantes, certificados) são armazenados no Amazon S3. Os arquivos estáticos continuam sendo servidos localmente pelo Nginx.

### Recursos AWS

| Recurso | Valor |
|---|---|
| Bucket | `liaison-media-2026` (região us-east-2) |
| Object Ownership | ACLs disabled (Bucket owner enforced) |
| Acesso público | Leitura via bucket policy (`s3:GetObject`) |
| Usuário IAM | `liaison-s3-user` (permissão AmazonS3FullAccess) |

### Configuração

O S3 é ativado pela flag `USE_S3` no `.env`. Sem ela (ambiente local de desenvolvimento), o Django usa o sistema de arquivos. **Nunca commite os valores reais.**

```env
USE_S3=True
AWS_ACCESS_KEY_ID=<access-key-do-iam>
AWS_SECRET_ACCESS_KEY=<secret-key-do-iam>
AWS_STORAGE_BUCKET_NAME=liaison-media-2026
```

Solicitar os valores reais ao @HenriqueFontenelle.

### Dependências

Adicionadas ao `requirements.txt`: `django-storages>=1.14` e `boto3`.

### Bucket Policy (leitura pública)

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicRead",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::liaison-media-2026/*"
  }]
}
```

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

| Membro | Papel |
|---|---|
| Henrique Fontenelle | Infra e Analista de Requisitos |
| Gustavo Cintra | Líder e Analista de Requisitos | 
| Luís Monteiro | Backend e Analista de Requisitos | 
| Pedro Vargas | Frontend e Analista de Requisitos | 
| Danilo Barros | QA e Analista de Requisitos | 
| Nicole Fernandes | Frontend e Analista de Requisitos | 

### Resetar senha de um usuário

```bash
python manage.py changepassword email@dominio.com
```

---

## Checklist de Encerramento (Fim do Semestre)

Executar **obrigatoriamente** ao final do projeto para garantir $0 de cobrança:

- [ ] Terminar instância EC2 → EC2 → Instances → Instance State → **Terminate**
- [ ] Deletar RDS `liaison-db` → RDS → Databases → **Delete** (sem snapshot final)
- [ ] Esvaziar e deletar bucket S3 `liaison-media-2026` → S3 → **Empty** → **Delete**
- [ ] Deletar usuário IAM `liaison-s3-user` → IAM → Users → **Delete**
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

*Última atualização: 02/06/2026 — @HenriqueFontenelle*
