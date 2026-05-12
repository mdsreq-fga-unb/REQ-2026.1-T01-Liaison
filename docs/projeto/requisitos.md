# 4 ENGENHARIA DE REQUISITOS

## 4.1 Atividades e Técnicas de ER

As seis atividades da Engenharia de Requisitos são praticadas de forma iterativa e entrelaçada ao longo do projeto, sem sequencialidade rígida. A seguir, são descritas as técnicas que a equipe Dona Izeti adotará em cada atividade no contexto do Liaison.

| Atividade de ER | Técnica adotada | Como será utilizada no projeto |
| :--- | :--- | :--- |
| Elicitação e Descoberta | Entrevista semiestruturada combinada com conversa guiada por temas | Reuniões quinzenais com o representante do cliente utilizando roteiro de perguntas combinado com exploração livre de temas emergentes. Permite capturar requisitos explícitos e necessidades latentes. |
| Análise e Consenso | Priorização MoSCoW, Matriz de Avaliação Técnica × Valor de Negócio e Workshops de Requisitos | Após cada sessão de elicitação, os requisitos são classificados em Must Have, Should Have, Could Have e Won't Have com validação do cliente. A Matriz de Avaliação Técnica × Valor de Negócio cruza o esforço estimado de implementação com o valor entregue, priorizando entregas de alto impacto e baixa complexidade para o MVP. Quando surgem ambiguidades ou conflitos de prioridade, a equipe realiza workshops internos para construir consenso antes de apresentar as decisões ao cliente. |
| Declaração | Histórias de Usuário, Casos de Uso em breve descrição e Critérios de Aceitação | Requisitos declarados no formato "Como [perfil], quero [ação], para [benefício]". Casos de uso em breve descrição mapeiam as interações essenciais entre os perfis e o sistema. Critérios de aceitação definem as condições verificáveis que cada história precisa atender para ser considerada concluída. |
| Representação | Protótipos e wireframes de tela | Funcionalidades representadas visualmente antes da implementação. Orientam o desenvolvimento e servem como base concreta para as sessões de validação com o cliente. |
| Verificação e Validação | Demonstração ao Cliente, Revisão de Critérios de Aceitação e Checklist | Ao final de cada ciclo, o incremento desenvolvido é apresentado ao cliente e feedback estruturado é coletado. Antes de cada demonstração, o Analista de QA conduz uma revisão sistemática dos critérios de aceitação por meio de checklists, verificando completude, consistência e testabilidade de cada item. |
| Organização e Atualização | Revisão e Repriorização do Backlog e Rastreabilidade de Requisitos | O backlog é revisado e repriorizado a cada reunião com o cliente, com os itens organizados no GitHub Projects nas colunas A fazer, Em progresso, Em revisão e Concluído. A rastreabilidade é mantida por meio de vínculos explícitos entre histórias de usuário, critérios de aceitação e características do produto definidas na seção 2.3. |





## 4.2 Engenharia de Requisitos e KanbanXP

A tabela a seguir apresenta como cada atividade de ER se encaixa nos momentos e práticas do KanbanXP, descrevendo a técnica utilizada e o resultado esperado no fluxo de trabalho.
      
| Momento/Prática no KanbanXP | Atividade da ER | Técnica | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| Descoberta e entrada no backlog | Elicitação e Descoberta | Entrevista semiestruturada, conversa guiada | Requisitos de alto nível identificados e registrados como itens candidatos |
| Refinamento antes de puxar o item | Análise e Consenso | Priorização MoSCoW, discussão técnica em equipe | Histórias priorizadas, com dependências identificadas, viáveis e compreendidas |
| Preparação da história (antes de iniciar) | Declaração | Histórias de usuário com critérios de aceitação explícitos | Histórias detalhadas com critérios claros que definem o que significa "pronto" |
| Apoio visual ao entendimento | Representação | Protótipos e wireframes de tela | Protótipos que orientam o desenvolvimento e antecipam a validação com o cliente |
| Desenvolvimento com práticas XP | Organização e Atualização | Gestão visual do quadro, integração contínua (CI) e TDD | Incremento de software desenvolvido segundo os critérios de aceitação |
| Revisão/Demonstração | Verificação e Validação | Demonstração do protótipo/software ao cliente | Funcionalidade validada; feedback coletado e ajustes mapeados |
| Revisão contínua do backlog | Organização e Atualização | Revisão do backlog no GitHub Projects | Backlog repriorizado e alinhado ao feedback e necessidades do cliente |
