# 9. Definição de Pronto (DoR) e Definição de Concluído (DoD)

## 9.1 Contextualização do Fluxo de Trabalho

Para organizar o desenvolvimento do nosso projeto utilizando a metodologia **KanbanXP**, a nossa equipe estabeleceu critérios práticos para controlar a entrada e a saída de tarefas no nosso quadro de trabalho. Precisamos garantir duas coisas básicas: que ninguém comece a programar algo que não foi bem entendido e que nenhuma funcionalidade seja entregue incompleta ou sem testes. 

Para isso, usamos duas ferramentas principais:
- **DoR (Definition of Ready):** É o nosso combinado do que uma história de usuário ou requisito precisa ter para que a gente possa puxá-la para a coluna *Em Desenvolvimento (In Progress)*. Se faltar informação ou o escopo estiver confuso, a tarefa não entra no fluxo.
- **DoD (Definition of Done):** É o nosso checklist de qualidade técnica e de negócio. Uma funcionalidade só sai de *Em Desenvolvimento* e vai para *Concluído (Done)* se passar por todos esses pontos, garantindo que o código entregue seja confiável.

A Auditoria do DoD é feita no momento da revisão do Pull Request (PR). O revisor do código é corresponsável por garantir que a lista foi cumprida antes de realizar o Merge.

Essa abordagem ajuda a evitar que a gente perca tempo com retrabalho ou com códigos que quebram outras partes do sistema (regressão), mantendo o ritmo de desenvolvimento do grupo saudável e alinhado com o que foi planejado na disciplina de Requisitos.

---

## 9.2 DoR — Definição de Pronto para Iniciar

Uma tarefa do nosso backlog só vai ser liberada para desenvolvimento quando o grupo validar que ela cumpre todos os critérios gerais de modelagem e os pontos específicos listados abaixo:

### 9.2.1 Critérios Gerais de DoR (Modelo INVEST)
* **DoR-G01:** A história de usuário está escrita no padrão do projeto (*"Como... Quero... Para..."*).
* **DoR-G02:** Tem pelo menos um cenário de aceitação estruturado no formato *Dado / Quando / Então*.
* **DoR-G03:** O escopo está bem definido para que um membro consiga codificar tudo em, no máximo, 3 dias de trabalho.
* **DoR-G04:** As dependências técnicas e os endpoints necessários para a tarefa já foram mapeados.
* **DoR-G05:** O requisito foi refinado e validado em conjunto pela equipe.
* **DoR-G06:** Para tarefas que envolvem frontend, o link do protótipo (Figma) deve estar anexado à tarefa.

---

## 9.3 DoD — Definição de Pronto para Concluir

Para garantir a qualidade técnica do que estamos entregando na disciplina, uma funcionalidade só sai da coluna *In Progress* para a coluna *Done* se passar no escrutínio de todos os critérios gerais e cumprir o seu critério de qualidade específico.

### 9.3.1 Critérios Gerais de DoD (Técnico e Processo)
* **DoD-G01:** O código foi versionado e está em Pull Request (PR) aberto no repositório do GitHub do projeto.
* **DoD-G02:** O PR passou por Code Review e recebeu a aprovação de pelo menos mais um integrante do grupo.
* **DoD-G03:** Todos os testes automatizados existentes continuam passando no pipeline de CI, sem quebrar funcionalidades antigas.
* **DoD-G04:** Os cenários descritos nos critérios de aceitação foram testados manualmente ou via testes de integração.
* **DoD-G05:** A documentação técnica ou comentários no código foram devidamente atualizados, se aplicável.
