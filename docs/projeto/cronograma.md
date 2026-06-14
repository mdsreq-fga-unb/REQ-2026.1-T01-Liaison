python3 << 'EOF'
content = open('docs/projeto/cronograma.md').read()

nova_secao = '''## 5.2 Status de Execução

Data de atualização: 14/06/2026. Percentual geral do MVP: **~60%**.

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

'''

inicio_52 = content.find('## 5.2 Status de Execução')
inicio_53 = content.find('## 5.3 Spike de Infraestrutura')

novo_content = content[:inicio_52] + nova_secao + content[inicio_53:]
open('docs/projeto/cronograma.md', 'w').write(novo_content)
print('OK')
EOF