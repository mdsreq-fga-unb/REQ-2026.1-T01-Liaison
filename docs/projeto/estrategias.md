# 3 ESTRATÉGIAS DE ENGENHARIA DE SOFTWARE

## 3.1 Estratégia Priorizada

*   **Abordagem:** Ágil
*   **Ciclo de Vida:** Incremental e Iterativo
*   **Processo:** KanbanXP

## 3.2 Quadro Comparativo

| Característica | KanbanXP | ScrumXP |
| :--- | :--- | :--- |
| Abordagem Geral | Iterativo e incremental com fluxo contínuo | Iterativo e incremental com fases fixas |
| Foco em Arquitetura | Arquitetura evolutiva e adaptável, com ajustes contínuos conforme as funcionalidades do aplicativo fluem pelo processo. | Menor foco inicialmente, mas evoluindo conforme a necessidade e tempo |
| Estrutura de Processos | Quadro Kanban e fases do XP: planejamento de requisitos, integração contínua, testes e validação | Estrutura Scrum (sprints, daily e backlog de produto) e fases do XP: planejamento de requisitos, iteração, validação |
| Flexibilidade de Requisitos | Novos requisitos podem ser inseridos e repriorizados continuamente no fluxo de trabalho sem aguardar o fim de um ciclo | Aborda os requisitos como variáveis e histórias de usuários, repriorizadas a cada nova Sprint |
| Colaboração com Cliente | Feedback e validação contínua conforme funcionalidades individuais do aplicativo são finalizadas | Cliente responsável por validar pequenas entregas ao final das Sprints |
| Complexidade do Processo | Foca na visualização e gestão assíncrona; não prescreve cerimônias ou iterações de duração fixa | Práticas Scrum e XP exigem organização rigorosa e participação síncrona frequente da equipe |
| Qualidade Técnica | Prioriza testes automatizados, integração contínua e refatoração, garantindo a integridade do código em um desenvolvimento assíncrono | Prioriza testes automatizados, integração contínua, refatoração |
| Práticas de Desenvolvimento | TDD, integração contínua, gestão visual do fluxo e padronização de código | TDD, pair programming, integração contínua |
| Adaptação ao Projeto do Liaison | Ideal para o cenário da equipe com restrições severas de horários em comum, otimizando o trabalho assíncrono e contínuo | Ideal para um cenário com alta disponibilidade de horários comuns para o planejamento de blocos fixos de trabalho |
| Documentação | Documentação mínima. O próprio quadro visual atua como rastreabilidade, complementado por código bem estruturado | Documentação mínima, apenas o necessário para o cliente e equipe |
| Controle de Qualidade | Testes automatizados contínuos e análise de métricas de fluxo para identificação de gargalos operacionais | Testes automatizados |
| Escalabilidade | Excelente aderência para o suporte contínuo de aplicativos, gerenciando demandas e interrupções de forma dinâmica | Boa em times pequenos e médios, difícil em times muito grandes |
| Suporte a Equipes de Desenvolvimento | Altamente favorável a equipes com horários flexíveis. Evita a sobrecarga de trabalho através da limitação de tarefas simultâneas (WIP) | Práticas XP ajudam na colaboração e qualidade. Contudo, as cerimônias do Scrum exigem alta sincronia diária |

## 3.3 Justificativa

O KanbanXP foi escolhido como processo de desenvolvimento do Liaison pelos seguintes motivos:

*   **Adequação ao perfil da equipe:** O Kanban é particularmente adequado para equipes que lidam com trabalho variável e imprevisível, e que buscam melhorar processos sem grandes reestruturações (Anderson, 2010). A equipe Dona Izeti é composta por seis integrantes com cargas acadêmicas distintas e sem disponibilidade garantida para reuniões síncronas regulares, cenário que o Kanban acomoda nativamente por não prescrever cerimônias fixas ou papéis rígidos.
*   **Gestão visual e transparência:** A visualização do fluxo de trabalho por meio do quadro Kanban permite que todos os integrantes saibam exatamente o estado de cada item, independentemente de quando acessam o projeto. Isso reduz a dependência de comunicação síncrona e mantém a transparência do progresso.
*   **Qualidade técnica garantida pelo XP:** O XP complementa o Kanban ao fornecer as práticas técnicas que o Kanban não prescreve. Conforme Beck e Andres (2004), o XP organiza os requisitos como histórias de usuário com critérios de aceitação explícitos, válida continuamente por meio de testes automatizados e promove a integração contínua, garantindo que o código produzido de forma assíncrona se mantenha coeso e funcional.
*   **Alinhamento com as entregas da disciplina:** O quadro da equipe será estruturado com marcos de entrega correspondentes às datas das Unidades (EU1, EU2, EU3, EU4), funcionando como checkpoints sem engessar o fluxo diário.
*   **Compatibilidade com o cliente:** O XP prevê que a elicitação é contínua e que o cliente participa ao longo do processo (Beck; Andres, 2004). O representante do cliente será consultado em reuniões quinzenais para validação de histórias de usuário e priorização do backlog.
