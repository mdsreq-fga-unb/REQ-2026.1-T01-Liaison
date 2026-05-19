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
| **RF07 Gerenciar vaga** | **US002.1** Como organização, desejo criar e gerenciar vagas de voluntariado para atrair estudantes interessados em participar das atividades da organização. | RNF04, RNF06 |
| **RF08 Buscar vaga** | **US002.2** Como estudante, desejo buscar e filtrar vagas de voluntariado para encontrar oportunidades que correspondam ao meu interesse e disponibilidade. | RNF04, RNF05, RNF06 |
| **RF09 Consultar vaga** | **US002.3** Como estudante, desejo visualizar os detalhes completos de uma vaga de voluntariado para decidir se devo me candidatar. | RNF04 |
| **RF10 Realizar candidatura** | **US002.4** Como estudante, desejo me candidatar a uma vaga de voluntariado ativa para participar das atividades da organização. | RNF04, RNF06 |
| **RF11 Avaliar candidatura** | **US002.6** Como organização, desejo avaliar as candidaturas dos estudantes para aprovar ou recusar participantes nas vagas de voluntariado. | RNF04, RNF06 |
| **RF12 Acompanhar candidatura** | **US002.5** Como estudante, desejo cancelar minha candidatura a uma vaga de voluntariado caso não tenha mais interesse ou disponibilidade.<br><br>**US002.7** Como usuário, desejo receber notificações sobre mudanças de status de candidaturas para me manter informado em tempo hábil. | RNF04 |
| **RF13 Listar aprovados** | **US003.1** Como organização, desejo visualizar a lista de estudantes aprovados para cada atividade de voluntariado para gerenciar o acompanhamento e a presença. | RNF04, RNF08 |
| **RF14 Registrar frequência** | **US003.2** Como organização, desejo registrar a presença e atestar a carga horária dos estudantes aprovados para documentar a participação nas atividades. | RNF04, RNF08 |
| **RF15 Emitir certificado** | **US003.3a** Como sistema, devo gerar automaticamente certificados digitais em PDF para os estudantes que completaram as atividades de voluntariado.<br><br>**US003.3b** Como sistema, devo permitir a exportação dos certificados gerados em formato PDF. | RNF07, RNF08, RNF09 |
| **RF16 Consultar histórico** | **US003.4a** Como estudante, desejo visualizar meu histórico de horas de voluntariado para acompanhar minha evolução.<br><br>**US003.4b** Como estudante, desejo fazer download dos meus certificados de voluntariado para comprovação acadêmica. | RNF04, RNF07, RNF08 |
| **RF17 Validar certificado** | **US003.5** Como qualquer pessoa, desejo acessar um portal público para validar a autenticidade de um certificado por meio de URL ou QR Code. | RNF07, RNF09 |

## 10.2 Priorização do Backlog e MVP

Para a priorização do backlog, a equipe adotou o método **ICE Score** (Impact, Confidence, Effort), conforme alinhado nas lições aprendidas e revisões do processo de engenharia de requisitos. Esse método permite uma ordenação objetiva fundamentada no valor gerado e no custo técnico.

Os critérios avaliados para cada História de Usuário são:

- **Impacto (Impact - I):** Valor gerado para o usuário e para os objetivos do produto (Escala de 1 a 10).
- **Confiança (Confidence - C):** Grau de segurança da equipe em relação à relevância e compreensão do requisito (Escala de 0,1 a 1,0).
- **Esforço (Effort - E):** Complexidade estimada de implementação e carga técnica (Escala de 1 a 10).

**Fórmula de Cálculo do ICE Score:**
`Pontuação ICE = (Impacto × Confiança) / Esforço`

Quanto maior a pontuação ICE, maior a prioridade da história para o negócio.

**Faixas de decisão adotadas pela equipe:**
- **ICE ≥ 1,50** → **Alta Prioridade (Núcleo do MVP)**
- **ICE entre 1,00 e 1,49** → **Média Prioridade (Próximas iterações)**
- **ICE < 1,00** → **Baixa Prioridade (Secundário/Futuro)**

A partir disso, foi gerada a seguinte tabela de priorização:

| US | Descrição | Impacto (I) | Confiança (C) | Esforço (E) | Score ICE | Prioridade Sugerida |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **US001.1** | Cadastro de Estudantes Universitários | x | y | z | - | A definir |
| **US001.2** | Cadastro de Organizações Sociais | x | y | z | - | A definir |
| **US001.3** | Autenticação de Usuários | x | y | z | - | A definir |
| **US001.4** | Gestão de Perfil do Estudante | x | y | z | - | A definir |
| **US001.5** | Edição de Perfil Institucional da Organização | x | y | z | - | A definir |
| **US001.6** | Fluxo de Recuperação de Senha via E-mail | x | y | z | - | A definir |
| **US001.7** | Painel Administrativo para Moderação | x | y | z | - | A definir |
| **US002.1** | Criação e Gestão de Vagas de Voluntariado | x | y | z | - | A definir |
| **US002.2** | Motor de Busca e Filtro de Vagas | x | y | z | - | A definir |
| **US002.3** | Visualização de Detalhes da Vaga | x | y | z | - | A definir |
| **US002.4** | Candidatura de Estudante em Vaga | x | y | z | - | A definir |
| **US002.5** | Cancelamento de Candidatura pelo Estudante | x | y | z | - | A definir |
| **US002.6** | Avaliação de Candidaturas pela Organização | x | y | z | - | A definir |
| **US002.7** | Sistema de Notificações de Status | x | y | z | - | A definir |
| **US003.1** | Listagem de Estudantes Aprovados | x | y | z | - | A definir |
| **US003.2** | Registro de Presença e Ateste de Carga Horária | x | y | z | - | A definir |
| **US003.3a** | Geração Automática de Certificado Digital | x | y | z | - | A definir |
| **US003.3b** | Exportação de Certificado Digital em PDF | x | y | z | - | A definir |
| **US003.4a** | Visualização de Histórico de Horas | x | y | z | - | A definir |
| **US003.4b** | Download de Certificados Digitais | x | y | z | - | A definir |
| **US003.5** | Portal Público de Validação de Certificados | x | y | z | - | A definir |
