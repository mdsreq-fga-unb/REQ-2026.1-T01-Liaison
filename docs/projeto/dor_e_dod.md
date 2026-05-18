# 8. DoR e DoD

## 8.1 Contextualização

No processo **KanbanXP** adotado pelo Liaison, a qualidade do fluxo de desenvolvimento depende de critérios explícitos que regulem **quando um item pode entrar em desenvolvimento** e **quando pode ser considerado concluído**. Esses critérios são formalizados em dois artefatos complementares:

- **DoR — Definition of Ready (Definição de Pronto para Iniciar):** conjunto de condições que um item do backlog deve satisfazer para ser puxado para a coluna *In Progress* do quadro Kanban.
- **DoD — Definition of Done (Definição de Pronto para Concluir):** conjunto de condições que um item em desenvolvimento deve satisfazer para ser considerado completo e avançar para a coluna *Done* do quadro.

Conforme a lógica do Kanban, **um item não deve entrar no fluxo se não estiver pronto para fluir sem interrupções** (DoR). Da mesma forma, **nenhum item deve ser declarado concluído sem que todos os critérios de qualidade acordados tenham sido atendidos** (DoD). Essa disciplina evita retrabalho, protege os limites de WIP e garante que o incremento entregue ao cliente seja confiável e verificável (MARSICANO, 2026).

A Definition of Done é um dos artefatos centrais do Scrum e de outros frameworks ágeis, sendo definida como o conjunto de critérios que definem quando um item do backlog está efetivamente completo (PRIES; QUIGLEY, 2010). No contexto do KanbanXP, ela também funciona como critério de saída da coluna de desenvolvimento, vinculando diretamente o critério de aceite da história de usuário à qualidade técnica do código produzido.

---

## 8.2 DoR — Definição de Pronto para Iniciar

Um item do Backlog do Produto está **Pronto para ser desenvolvido** quando atende a **todos** os critérios abaixo:

| # | Critério | Verificação |
|---|---|---|
| **DoR-01** | A história de usuário está redigida no formato: *"Como \<usuário\>, Quero \<objetivo\>, Para \<benefício\>"* | Sim/Não |
| **DoR-02** | Os critérios de aceitação estão definidos no formato *Dado/Quando/Então* (mínimo 1 cenário de aceite por história) | Sim/Não |
| **DoR-03** | A história é independente — não bloqueia nem é bloqueada por outro item *In Progress* simultaneamente | Sim/Não |
| **DoR-04** | A história é estimável — a equipe compreende o que precisa ser implementado para concluí-la dentro de um ciclo | Sim/Não |
| **DoR-05** | A história é pequena o suficiente para ser concluída em até 3 dias de desenvolvimento por um único membro | Sim/Não |
| **DoR-06** | A história tem valor verificável — é possível demonstrar ao cliente/representante do produto que foi entregue | Sim/Não |
| **DoR-07** | As dependências técnicas estão mapeadas (ex.: endpoints de API, modelos de banco, bibliotecas) e não há bloqueios ativos para iniciar o desenvolvimento | Sim/Não |
| **DoR-08** | Quando a história envolve interação visual com o usuário, existe ao menos um wireframe, protótipo ou descrição de tela correspondente disponível para a equipe | Sim/Não |
| **DoR-09** | A história foi revisada e aprovada pelo responsável pelo produto (Gustavo Cintra) na atividade de refinamento do backlog | Sim/Não |

> **Nota de alinhamento com o processo:** Os critérios DoR-01 a DoR-06 refletem os atributos do modelo **INVEST** (Independent, Negotiable, Valuable, Estimable, Small, Testable), amplamente referenciado na literatura de requisitos ágeis (WIEGERS; BEATTY, 2013) e discutido no contexto de histórias de usuário em Marsicano (2026, Cap. 9). O DoR-07 está alinhado com a política explícita de trabalho do KanbanXP do Liaison (seção 3.4 do GitPages), que determina que dependências devem ser resolvidas antes de um item ser puxado para *In Progress*. O DoR-08 atende à diretriz do template do professor (seção 8.1) que exige o mapeamento de interface quando aplicável.

---

## 8.3 DoD — Definição de Pronto para Concluir

Um item do Backlog do Produto está **Concluído** quando atende a **todos** os critérios abaixo:

### 8.3.1 Critérios de Qualidade Técnica (XP)

| # | Critério | Verificação |
|---|---|---|
| **DoD-01** | O código foi implementado e está disponível na branch correspondente no repositório GitHub | Sim/Não |
| **DoD-02** | O código passou por revisão por pares (*Code Review*) e foi aprovado por ao menos um outro membro da equipe via Pull Request | Sim/Não |
| **DoD-03** | O código está aderente aos padrões de codificação definidos pela equipe — passou pela verificação de linter configurado no repositório e segue as convenções de nomenclatura, estrutura de pastas e estilo acordadas | Sim/Não |
| **DoD-04** | Testes automatizados foram escritos para cobrir os cenários definidos nos critérios de aceitação (DoR-02) | Sim/Não |
| **DoD-05** | Todos os testes automatizados da suite do projeto estão passando (sem regressões introduzidas) | Sim/Não |
| **DoD-06** | O código foi integrado à branch principal sem conflitos e o pipeline de integração contínua (CI) executou com sucesso | Sim/Não |

### 8.3.2 Critérios de Qualidade do Produto (Requisitos)

| # | Critério | Verificação |
|---|---|---|
| **DoD-07** | Todos os critérios de aceitação definidos no DoR-02 foram verificados e estão atendidos | Sim/Não |
| **DoD-08** | A funcionalidade foi demonstrada e validada pelo responsável pelo produto (ou pelo cliente, quando aplicável) assim que o item chegou à coluna *Done* no quadro Kanban | Sim/Não |
| **DoD-09** | A funcionalidade não viola nenhuma regra de negócio ou restrição não funcional definida no backlog | Sim/Não |
| **DoD-10** | Os Requisitos Não Funcionais vinculados à história foram verificados — desempenho (tempo de resposta), segurança, confiabilidade e suportabilidade foram testados e atendem aos índices definidos nos RNFs do projeto (ex.: RNF02 login ≤ 2s, RNF05 busca ≤ 3s, RNF06 suporte a 1.000 usuários simultâneos) | Sim/Não |

### 8.3.3 Critérios de Qualidade do Processo (Rastreabilidade)

| # | Critério | Verificação |
|---|---|---|
| **DoD-11** | A Issue correspondente à história no GitHub está vinculada ao Pull Request, ao conjunto de commits que a implementam e ao card no quadro Kanban | Sim/Não |
| **DoD-12** | O card no quadro Kanban foi movido para a coluna *Done* somente após todos os critérios anteriores terem sido satisfeitos, respeitando os limites de WIP do fluxo | Sim/Não |
| **DoD-13** | A documentação técnica mínima foi produzida — toda funcionalidade que introduz nova tela visível ao usuário ou novo comportamento de RNF deve ter o GitPages atualizado correspondentemente | Sim/Não |

---

## 8.4 Relação entre DoR, DoD e os Critérios de Aceitação

O diagrama a seguir ilustra como os três elementos se articulam no fluxo do KanbanXP:

```
BACKLOG
┌─────────────────────────────┐
│  Item: História de Usuário  │  ← Redigida com formato + critérios de aceitação
│  (aguardando refinamento)   │     (Dado/Quando/Então) + interface mapeada (DoR-08)
└────────────┬────────────────┘
             │ Verificação do DoR (todos os 9 critérios)
             ▼
IN PROGRESS
┌─────────────────────────────┐
│   Desenvolvimento + Testes  │  ← Código + linter + testes + Code Review
└────────────┬────────────────┘
             │ Verificação do DoD (todos os 13 critérios)
             ▼
DONE
┌─────────────────────────────┐
│   Incremento de Software    │  ← Pronto para demonstração ao cliente
│   verificável e rastreável  │     RNFs verificados + GitPages atualizado
└─────────────────────────────┘
```

Os **critérios de aceitação** (definidos no DoR-02) são o elo central dessa cadeia: nascidos durante o refinamento do backlog, eles orientam a implementação e os testes automatizados (DoD-04 e DoD-05) e são a base da demonstração ao cliente (DoD-08). Dessa forma, a rastreabilidade entre o **requisito declarado** e a **evidência de implementação** é preservada ao longo de todo o ciclo de vida do item.

A verificação de **Requisitos Não Funcionais** (DoD-10) fecha o ciclo entre os RNFs declarados na seção 8.2 do documento de Visão do Produto e a entrega efetiva de cada história, garantindo que desempenho, segurança e confiabilidade não sejam tratados apenas como requisitos globais, mas como critérios concretos a serem verificados a cada incremento que os impacte.

---

> **Referência de lastro:** Este tópico se fundamenta na definição de *Definition of Done* presente na seção de artefatos do Scrum (PRIES; QUIGLEY, 2010, apud MARSICANO, 2026, p. 88), nos critérios de qualidade do processo KanbanXP definidos na Seção 3.5 deste documento, nas políticas de trabalho do Kanban definidas na Seção 3.4, e nas diretrizes de histórias de usuário e critérios de aceitação apresentadas nas Seções 9.4.3.1 e 9.4.2.6 de **Requisitos de Software – Comunicação é tudo!** (MARSICANO, 2026, p. 175–176). O critério de mapeamento de interface (DoR-08) e os critérios de padrão de codificação (DoD-03), verificação de RNFs (DoD-10) e documentação viva (DoD-13) foram incorporados em alinhamento com as diretrizes do template do professor (seção 8 do TEMPLATE_REQ_2026_1_v6) e com os Requisitos Não Funcionais declarados na Seção 8.2 do Documento de Visão do Produto e Projeto do Liaison.
