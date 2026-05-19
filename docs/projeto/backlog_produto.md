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
| **US001.7** | Painel Administrativo para Moderação | 10 | 1,0 | 1 | 10,00 | Alta |
| **US002.4** | Candidatura de Estudante em Vaga | 10 | 1,0 | 1 | 10,00 | Alta |
| **US002.6** | Avaliação de Candidaturas pela Organização | 10 | 1,0 | 1 | 10,00 | Alta |
| **US002.1c** | Publicação de Vagas de Voluntariado | 10 | 1,0 | 2 | 5,00 | Alta |
| **US002.3** | Visualização de Detalhes da Vaga | 10 | 1,0 | 2 | 5,00 | Alta |
| **US003.1** | Listagem de Estudantes Aprovados | 10 | 1,0 | 2 | 5,00 | Alta |
| **US001.3** | Autenticação de Usuários | 10 | 0,9 | 2 | 4,50 | Alta |
| **US002.1d** | Encerramento de Vagas de Voluntariado | 8 | 1,0 | 2 | 4,00 | Alta |
| **US001.2** | Cadastro de Organizações Sociais | 10 | 1,0 | 3 | 3,33 | Alta |
| **US003.4a** | Visualização de Histórico de Horas | 6 | 1,0 | 2 | 3,00 | Alta |
| **US003.4b** | Download de Certificados Digitais | 6 | 1,0 | 2 | 3,00 | Alta |
| **US002.5** | Cancelamento de Candidatura pelo Estudante | 6 | 0,8 | 2 | 2,40 | Alta |
| **US002.7** | Sistema de Notificações de Status | 6 | 0,8 | 2 | 2,40 | Alta |
| **US003.2** | Registro de Presença e Ateste de Carga Horária | 7 | 1,0 | 3 | 2,33 | Alta |
| **US001.1** | Cadastro de Estudantes Universitários | 10 | 1,0 | 6 | 1,67 | Alta |
| **US002.2** | Motor de Busca e Filtro de Vagas | 10 | 0,8 | 5 | 1,60 | Alta |
| **US003.3a** | Recebimento Automático de Certificado Digital | 10 | 1,0 | 7 | 1,43 | Média |
| **US003.3b** | Exportação de Certificado Digital em PDF | 10 | 1,0 | 7 | 1,43 | Média |
| **US001.4** | Gestão de Perfil do Estudante | 10 | 0,8 | 6 | 1,33 | Média |
| **US001.5** | Edição de Perfil Institucional da Organização | 10 | 0,8 | 6 | 1,33 | Média |
| **US002.1b** | Edição de Vagas de Voluntariado | 10 | 0,8 | 6 | 1,33 | Média |
| **US003.5** | Portal Público de Validação de Certificados | 10 | 0,6 | 8 | 0,75 | Baixa |
| **US002.1** | Criação de Vagas de Voluntariado | 10 | 0,6 | 9 | 0,67 | Baixa |
| **US001.6** | Fluxo de Recuperação de Senha via E-mail | 6 | 0,8 | 8 | 0,60 | Baixa |
