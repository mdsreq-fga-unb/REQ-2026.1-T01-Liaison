# 3 ESTRATÉGIAS DE ENGENHARIA DE SOFTWARE

## 3.1 Estratégia Priorizada

*   **Abordagem:** Ágil
*   **Ciclo de Vida:** Incremental e Iterativo
*   **Processo:** KanbanXP

## 3.2 Quadro Comparativo

O quadro a seguir apresenta uma comparação entre o **KanbanXP** (um processo ágil focado em fluxo contínuo) e o **OpenUP** (um processo híbrido estruturado em fases). Essa comparação visa demonstrar as diferenças fundamentais nas abordagens de desenvolvimento, arquitetura, práticas de qualidade e flexibilidade, justificando a escolha do processo mais adequado para a equipe e o projeto.

| Característica | KanbanXP | OpenUP (Open Unified Process) |
| :--- | :--- | :--- |
| **Abordagem e Ciclo de Vida** | Ágil. Iterativo e incremental com entregas em **fluxo contínuo**, puxando as tarefas sob demanda. | Híbrido. Iterativo e incremental, porém estruturado em **fases fixas** (Iniciação, Elaboração, Construção, Transição). |
| **Foco em Arquitetura** | Evolutiva e adaptável. O design começa simples e evolui contínua e incrementalmente através de refatoração, conforme as funcionalidades são desenvolvidas. | Arquitetura robusta e intencional. Forte foco na definição, estabilização e validação de uma arquitetura central logo nas fases iniciais (Elaboração). |
| **Estrutura de Processos** | Quadro Kanban para gestão visual do fluxo (limitando WIP) e práticas do XP para engenharia de software (TDD, integração contínua). | Fases bem definidas com marcos (milestones) que exigem artefatos específicos e planejamento detalhado para aprovação e avanço de fase. |
| **Flexibilidade de Requisitos** | Altíssima. Requisitos podem ser repriorizados, inseridos ou alterados no fluxo a qualquer momento, adaptando-se rapidamente a feedbacks sem prejudicar o ciclo. | Flexível dentro das iterações, porém mudanças estruturais que impactam a arquitetura definida nas fases iniciais tornam-se mais onerosas e difíceis de acomodar posteriormente. |
| **Práticas de Engenharia e Qualidade** | Fortemente baseadas em código: TDD (Test-Driven Development), programação em pares, integração contínua e refatoração constante garantem a integridade do produto a cada *commit*. | Qualidade assegurada pela validação contínua da arquitetura, casos de uso bem documentados e testes de iteração ao final de cada fase, com menos prescrição de práticas de codificação de baixo nível. |
| **Documentação e Rastreabilidade** | Documentação enxuta (Histórias de Usuário). A rastreabilidade é garantida tecnicamente pela ligação entre Histórias, *Commits*, Testes Automatizados e *Pull Requests*, e não apenas pelo quadro visual. | Exige documentação mais formal para aprovação de fases, com ênfase na rastreabilidade entre requisitos originais, casos de uso e documentos de arquitetura. |
| **Colaboração com o Cliente** | Contínua e informal. O cliente valida as funcionalidades sob demanda, assim que os critérios de aceitação são concluídos no fluxo de desenvolvimento. | Envolvimento contínuo, porém com marcos de validação mais formais (especialmente nas transições de fase e entregas de iteração). |
| **Adaptação à Equipe e Projeto** | Ideal para a equipe do projeto, que possui restrições severas de horários em comum. A gestão visual assíncrona aliada às práticas rigorosas de código acomodam a rotina variável dos membros. | Exige maior rigor em sincronia, documentação inicial e processos formais de revisão de fases, o que sobrecarregaria o tempo escasso da equipe para reuniões conjuntas. |

## 3.3 Justificativa

Com base na comparação com um processo híbrido e dirigido a fases como o OpenUP, o **KanbanXP** foi escolhido como processo de desenvolvimento do Liaison pelos seguintes motivos estratégicos e técnicos:

*   **Adequação ao perfil e disponibilidade da equipe:** A equipe Dona Izeti é composta por integrantes com cargas acadêmicas distintas e forte restrição de horários para reuniões síncronas. Enquanto processos baseados em fases (como OpenUP) ou Sprints (como Scrum) exigem forte sincronia de planejamento, o Kanban acomoda nativamente esse cenário através do fluxo assíncrono (*pull system*), onde os desenvolvedores puxam tarefas conforme sua disponibilidade, limitados apenas pelo *Work in Progress* (WIP).
*   **Qualidade técnica sem burocracia excessiva:** Em vez de focar na qualidade através de documentações exaustivas de arquitetura e casos de uso (como preconiza o OpenUP nas fases de Iniciação e Elaboração), o KanbanXP garante a integridade do produto "direto no código". O uso das práticas do eXtreme Programming (TDD, integração contínua, revisão de código e refatoração) assegura que as contribuições assíncronas dos membros se mantenham coesas, funcionais e livres de regressões.
*   **Rastreabilidade ágil e prática:** Corrige-se a premissa comum de que um quadro visual é suficiente para rastrear o software. No KanbanXP adotado pela equipe, a rastreabilidade será garantida pelo ecossistema de ALM (Application Lifecycle Management) do GitHub, conectando as Histórias de Usuário (Issues) diretamente aos seus respectivos *Commits*, *Pull Requests* e execução de testes automatizados, fornecendo um histórico claro entre o requisito e a implementação sem o peso documental de processos tradicionais.
*   **Flexibilidade e Entrega de Valor:** O projeto lida com a descoberta contínua de requisitos para conectar estudantes e trabalho voluntário. O KanbanXP permite que o *backlog* seja repriorizado constantemente e que o software seja entregue e validado com o cliente assim que uma funcionalidade flui para o fim do quadro, não sendo necessário aguardar a virada de uma Sprint ou o fim de uma fase de construção.

## 3.4 Políticas de Trabalho do Kanban

Para garantir o bom andamento do fluxo (flow) e evitar gargalos, a equipe estabelece as seguintes políticas explícitas para as colunas do quadro:

*   **Puxar (Pull System):** Um membro da equipe só deve puxar um novo item para *In Progress* quando tiver concluído ou bloqueado temporariamente sua tarefa atual.
*   **Limites de WIP (Work in Progress):** Serão estabelecidos e respeitados limites de tarefas simultâneas para as colunas de desenvolvimento e revisão, evitando a sobrecarga e garantindo a conclusão dos itens em andamento.
*   **Tratamento de Bloqueios:** Qualquer item impedido de avançar deve ser sinalizado imediatamente no quadro (via tags/labels como *blocked*). A equipe deve priorizar o desbloqueio desse item antes de iniciar novos trabalhos.
*   **Transição de Estados:** O avanço de um card para a próxima coluna exige que os critérios de saída da coluna atual tenham sido integralmente cumpridos.

## 3.5 Critérios de Qualidade

A qualidade no desenvolvimento do Liaison não se limita apenas a métricas de código, sendo abordada sob três perspectivas fundamentais que garantem a construção correta do produto e a entrega contínua de valor:

*   **Qualidade do Processo (Fluxo Kanban):** Avaliada pela fluidez contínua dos itens no quadro. Um item possui qualidade de processo quando suas dependências são mapeadas e resolvidas previamente, garantindo que ele possa atravessar o fluxo sem gerar bloqueios prolongados ou sobrecarregar a equipe (respeitando os limites de WIP).
*   **Qualidade Técnica (Engenharia XP):** Assegurada pelas práticas do Extreme Programming. O código desenvolvido deve ser, obrigatoriamente, validado por meio de revisão por pares (*Code Review*) antes de ser considerado pronto.
*   **Qualidade do Produto (Requisitos e Validação):** Garantida pelo cumprimento rigoroso dos Critérios de Aceitação definidos para cada História de Usuário. Nenhum incremento de software avança para a conclusão sem atender às necessidades de negócio elicitadas e sem ser passível de demonstração para coleta de feedback.
