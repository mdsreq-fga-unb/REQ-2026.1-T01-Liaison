# 10 BACKLOG DO PRODUTO

Aqui, cabe destacar que todas as histórias de usuários relacionadas, a seguir, são derivadas da lista de requisitos funcionais apresentados, anteriormente, neste documento. Esta é uma lista preliminar e deverá sofrer ajustes sempre que necessário, durante o desenvolvimento do produto Liaison.

## 10.1 Backlog Geral

A tabela, a seguir, apresenta cada um dos requisitos funcionais (RFs) declarados utilizando a técnica de user story (US), assim como a rastreabilidade com os requisitos não funcionais (RNFs).

| RF | User Story derivada | RNFs relacionados |
| :--- | :--- | :--- |
| **RF01 Cadastrar estudante** | **US001.1** Como estudante universitário, desejo me cadastrar na plataforma para poder buscar e me candidatar a vagas de voluntariado. | RNF01, RNF02 |
| **RF02 Cadastrar organização** | **US001.2** Como representante de uma organização social, desejo cadastrar minha organização na plataforma para poder publicar vagas de voluntariado. | RNF01, RNF03 |
| **RF03 Autenticar usuário** | **US001.3** Como usuário (estudante, organização ou administrador), desejo fazer login na plataforma de forma segura para acessar funcionalidades específicas do meu perfil. | RNF01, RNF02 |
| **RF04 Gerenciar perfil** | **US001.4** Como estudante, desejo gerenciar e editar meu perfil para manter minhas informações atualizadas e relevantes para oportunidades de voluntariado.<br><br>**US001.5** Como organização, desejo editar meu perfil institucional para manter as informações da organização atualizadas e atrativas para estudantes voluntários. | RNF04 |
| **RF05 Recuperar senha** | **US001.6** Como usuário, desejo recuperar minha senha via e-mail para poder acessar minha conta caso esqueça a senha. | RNF01 |
| **RF06 Moderar organização** | **US001.7** Como administrador (Sysmin), desejo ter um painel para moderar cadastros de organizações sociais para garantir a legitimidade das organizações na plataforma. | RNF04 |
| **RF18 Criar oportunidade** | **US002.1** Como organização, desejo criar novas vagas de voluntariado para atrair estudantes interessados em participar das atividades da organização. | RNF04, RNF06 |
| **RF19 Editar oportunidade** | **US002.1b** Como organização, desejo editar informações de vagas de voluntariado existentes para mantê-las atualizadas. | RNF04 |
| **RF20 Publicar oportunidade** | **US002.1c** Como organização, desejo publicar vagas de voluntariado para que fiquem visíveis aos estudantes. | RNF04 |
| **RF21 Encerrar oportunidade** | **US002.1d** Como organização, desejo encerrar vagas de voluntariado quando não houver mais necessidade. | RNF04 |
| **RF08 Buscar vaga** | **US002.2** Como estudante, desejo buscar e filtrar vagas de voluntariado para encontrar oportunidades que correspondam ao meu interesse e disponibilidade. | RNF04, RNF05, RNF06 |
| **RF09 Consultar vaga** | **US002.3** Como estudante, desejo visualizar os detalhes completos de uma vaga de voluntariado para decidir se devo me candidatar. | RNF04 |
| **RF10 Realizar candidatura** | **US002.4** Como estudante, desejo me candidatar a uma vaga de voluntariado ativa para participar das atividades da organização. | RNF04, RNF06 |
| **RF11 Avaliar candidatura** | **US002.6** Como organização, desejo avaliar as candidaturas dos estudantes para aprovar ou recusar participantes nas vagas de voluntariado. | RNF04, RNF06 |
| **RF12 Acompanhar candidatura** | **US002.5** Como estudante, desejo cancelar minha candidatura a uma vaga de voluntariado caso não tenha mais interesse ou disponibilidade.<br><br>**US002.7** Como usuário, desejo receber notificações sobre mudanças de status de candidaturas para me manter informado em tempo hábil. | RNF04 |
| **RF13 Listar aprovados** | **US003.1** Como organização, desejo visualizar a lista de estudantes aprovados para cada atividade de voluntariado para gerenciar o acompanhamento e a presença. | RNF04, RNF08 |
| **RF14 Registrar frequência** | **US003.2** Como organização, desejo registrar a presença e atestar a carga horária dos estudantes aprovados para documentar a participação nas atividades. | RNF04, RNF08 |
| **RF15 Emitir certificado** | **US003.3a** Como estudante, desejo receber automaticamente meu certificado digital em PDF ao concluir uma atividade de voluntariado.<br><br>**US003.3b** Como estudante, desejo exportar meus certificados digitais em formato PDF para comprovação acadêmica. | RNF07, RNF08, RNF09 |
| **RF16 Consultar histórico** | **US003.4a** Como estudante, desejo visualizar meu histórico de horas de voluntariado para acompanhar minha evolução.<br><br>**US003.4b** Como estudante, desejo fazer download dos meus certificados de voluntariado para comprovação acadêmica. | RNF04, RNF07, RNF08 |
| **RF17 Validar certificado** | **US003.5** Como qualquer pessoa, desejo acessar um portal público para validar a autenticidade de um certificado por meio de URL ou QR Code. | RNF07, RNF09 |

## 10.2 Priorização do Backlog e MVP

Para a priorização do backlog, a equipe adotou o método **ICE Score** (Impact, Confidence, Effort), conforme alinhado nas lições aprendidas e revisões do processo de engenharia de requisitos. Esse método permite uma ordenação objetiva fundamentada no valor gerado e no custo técnico.

Os critérios avaliados para cada requisito são:

- **Impacto (Impact - I):** Valor gerado para o usuário e para os objetivos do produto (Escala de 1 a 10).
- **Confiança (Confidence - C):** Grau de segurança da equipe de que o valor de Impacto atribuído está correto e de que o requisito realmente entrega aquele montante de valor (Escala de 0,1 a 1,0).
- **Esforço (Effort - E):** Complexidade estimada de implementação e carga técnica (Escala de 1 a 10).

**Fórmula de Cálculo do ICE Score:**
`Pontuação ICE = (Impacto × Confiança) / Esforço`

Com base nos valores de Impacto e Esforço, os requisitos foram distribuídos em uma **matriz de priorização** com quatro quadrantes:

|  | **Baixo Esforço** | **Alto Esforço** |
|---|---|---|
| **Alto Impacto** | ⚡ **Quick Wins** — implementar primeiro | 🎯 **Strategic** — planejar com cuidado |
| **Baixo Impacto** | 📥 **Fill In** — preencher quando houver folga | ⛔ **Avoid** — evitar ou postergar |

A ordenação dentro de cada quadrante segue o **Score ICE** (decrescente).

---

### ⚡ Quick Wins (Alto Impacto, Baixo Esforço)

| ID | Descrição | I | C | E | ICE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **RF06** | Moderar organização | 10 | 1,0 | 1 | 10,00 |
| **RF10** | Realizar candidatura | 10 | 1,0 | 1 | 10,00 |
| **RF11** | Avaliar candidatura | 10 | 1,0 | 1 | 10,00 |
| **RNF01** | Criptografia de senhas (bcrypt) | 10 | 1,0 | 1 | 10,00 |
| **RNF04** | Interface responsiva (iOS e Android) | 10 | 1,0 | 1 | 10,00 |
| **RF03** | Autenticar usuário | 10 | 1,0 | 2 | 5,00 |
| **RF09** | Consultar vaga | 10 | 1,0 | 2 | 5,00 |
| **RF13** | Listar aprovados | 10 | 1,0 | 2 | 5,00 |
| **RF20** | Publicar oportunidade | 10 | 1,0 | 2 | 5,00 |
| **RNF02** | Login em até 2 segundos | 10 | 0,9 | 2 | 4,50 |
| **RNF05** | Busca em até 3 segundos | 10 | 0,9 | 2 | 4,50 |
| **RNF06** | Suporte a 1.000 usuários simultâneos | 10 | 0,8 | 2 | 4,00 |
| **RF21** | Encerrar oportunidade | 8 | 0,9 | 2 | 3,60 |
| **RF02** | Cadastrar organização | 10 | 1,0 | 3 | 3,33 |
| **RF16** | Consultar histórico | 6 | 1,0 | 2 | 3,00 |
| **RNF09** | UUIDs para certificados | 10 | 0,6 | 2 | 3,00 |
| **RF12** | Acompanhar candidatura | 6 | 0,8 | 2 | 2,40 |
| **RF14** | Registrar frequência | 7 | 1,0 | 3 | 2,33 |
| **RF08** | Buscar vaga | 10 | 0,8 | 5 | 1,60 |

### 🎯 Strategic (Alto Impacto, Alto Esforço)

| ID | Descrição | I | C | E | ICE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **RF01** | Cadastrar estudante | 10 | 1,0 | 6 | 1,67 |
| **RF04** | Gerenciar perfil | 10 | 1,0 | 6 | 1,67 |
| **RF19** | Editar oportunidade | 10 | 1,0 | 6 | 1,67 |
| **RF15** | Emitir certificado | 10 | 1,0 | 7 | 1,43 |
| **RF18** | Criar oportunidade | 10 | 1,0 | 9 | 1,11 |
| **RF17** | Validar certificado | 10 | 0,6 | 8 | 0,75 |
| **RF05** | Recuperar senha | 6 | 0,8 | 8 | 0,60 |

### ⛔ Avoid (Baixo Impacto, Alto Esforço)

| ID | Descrição | I | C | E | ICE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **RNF07** | Geração assíncrona de PDFs | 2 | 0,5 | 7 | 0,14 |

### 📥 Fill In (Baixo Impacto, Baixo Esforço)

| ID | Descrição | I | C | E | ICE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **RNF03** | Validação de CNPJ | 5 | 1,0 | 1 | 5,00 |
| **RNF08** | Imutabilidade de certificados | 4 | 0,7 | 4 | 0,70 |
