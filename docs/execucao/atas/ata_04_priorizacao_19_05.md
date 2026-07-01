# Ata de Reunião: Priorização de Requisitos (ICE Score) e DoD

## 📹 Gravação do Encontro
<iframe width="100%" height="400" src="https://www.youtube.com/embed/SEU_LINK_AQUI" title="Gravação da Reunião" frameborder="0" allowfullscreen></iframe>

---

## 📝 Resumo Executivo

**Data:** 19/05/2026  
**Duração:** ~50 minutos  
**Participantes:** Equipe Liaison

### 🎯 Tópicos Discutidos e Decisões
* **Alinhamento sobre DoR e DoD:** A equipe discutiu as divergências entre a versão atual do template exigido pela disciplina e o material das aulas, definindo como os Critérios de Aceite (DoR/DoD) seriam atrelados às *User Stories* específicas versus os critérios gerais do projeto.
* **Execução da Matriz ICE Score:** A equipe realizou, em tempo real, a pontuação conjunta dos requisitos. Foi estipulado o fluxo de debate para chegar a um consenso nas métricas de **Impacto (1 a 10)**, **Esforço (1 a 10)** e **Confiança (0 a 1)** para cada funcionalidade.
* **Decisões Técnicas de Requisitos:**
  * Definida a métrica base para o Requisito de Desempenho: O sistema deve suportar até 1.000 usuários simultâneos (estimativa com base nos alunos da FGA e ONGs).
  * O Requisito de Busca deve retornar os resultados filtrados em menos de 3 segundos.
  * O fluxo de Cadastro de Organizações foi repensado: ao invés de um CRUD administrativo complexo, a organização fará seu próprio cadastro que ficará pendente até aprovação (status) por um Sysmin, reduzindo a complexidade (Esforço) de desenvolvimento.
