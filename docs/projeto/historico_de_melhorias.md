# 12. Histórico de Melhorias

Esta seção apresenta a evolução do projeto entre as entregas, demonstrando como os feedbacks das Unidades foram processados e quais correções técnicas foram implementadas.


## 12.1 Issues Abertas em Cada Unidade

### Unidade 1
* **Issue #1: Objetivos Específicos (OE) do Produto x Características de Produto (CP):** Apontamento sobre o excesso e o nível inadequado de granularidade dos objetivos e características mapeados (como "Controle de presença" e "Emissão de certificados", que estavam muito específicos/baixos).
* **Issue #3: Estratégias de Engenharia de Software:** Crítica à superficialidade e fragilidade conceitual na tabela comparativa entre as abordagens KanbanXP e ScrumXP. Foram apontadas que características técnicas idênticas do XP (como testes automatizados, refatoração e integração contínua) foram listadas como se fossem diferenciais entre as abordagens. Também foi criticada a afirmação de que "o quadro visual por si só garante rastreabilidade" e a falta de distinção real nos processos de validação com o cliente, exigindo um embasamento teórico robusto e a revisão completa da matriz de comparação.
* **Issue #4: Atividades e Técnicas de ER:** Crítica quanto à insuficiência de técnicas mapeadas para o processo de software. A priorização MoSCoW, o uso de Histórias de Usuário e a Demonstração de protótipos foram considerados insuficientes isoladamente, e o uso do *GitHub Projects* foi incorretamente classificado como técnica, sendo na verdade uma ferramenta.
* **Issue #5: Engenharia de Requisitos e KanbanXP:** Questionamento sobre o uso do quadro Kanban como um processo prescritivo em que as colunas representavam fases estanques de Engenharia de Requisitos (ER), contrariando a lógica de gestão de fluxo do método.
* **Issue #6: Cronograma e Entregas:** Crítica à falta de alinhamento entre dois planejamentos de cronograma diferentes apresentados no documento, que não conversavam entre si. Além disso, foi apontado que a estrutura planejada para a "Release 2" estava sobrecarregada com tarefas puras de infraestrutura e configuração de ambiente, falhando em entregar valor prático ou funcionalidades reais para o produto.
* **Issue #7: Composição da Equipe:** Alerta sobre a atribuição de papéis, destacando a obrigatoriedade de que todos os integrantes atuem como Analistas de Requisitos, além de apontar que as descrições das funções estavam superficiais e inadequadas.


### Unidade 2
* **Issue #71: Consolidar a rastreabilidade em uma visão integrada:** Observação do professor apontando que os elos de rastreabilidade entre o problema, objetivos específicos, características do produto, requisitos funcionais e não funcionais estavam dispersos em diferentes arquivos do repositório. Embora a amarração existisse, a falta de centralização obrigava o leitor a navegar por múltiplas páginas para compreender o encadeamento lógico do escopo.
* **Issue #72: Refinar os Requisitos Não Funcionais:** Foi apontado que as restrições técnicas e de qualidade (RNFs) estavam descritas em nível de abstração alto, resultando em baixa verificabilidade. Foram citados problemas como definições abstratas de segurança, referências genéricas a sistemas operacionais (Android/iOS) sem especificação de versões e falta de métricas quantitativas e mensuráveis para testes de carga e performance.
* **Issue #73: Documentar o padrão de identificação das histórias de usuário:** Crítica à falta de transparência e formalização no padrão de nomenclatura das IDs das histórias de usuário (como a sequência 001.1, 001.2, 001.3). 
* **Issue #75: Corrigir inconsistências na identificação dos requisitos:** Crítica apontando divergências e falta de padrão entre a listagem original de requisitos e os identificadores usados nas tabelas de priorização (ex: o surgimento de códigos fora do padrão como RF 2.1B, RF 2.1C e RF 2.1D). A numeração abstrata gerou duplicatas ocultas e colisões lógicas na estrutura de rastreamento do projeto, exigindo uma varredura completa para alinhar as IDs em todos os artefatos do documento.
* **Issue #76: Priorização do Backlog e MVP:** Crítica à falta de clareza e confusão metodológica no uso simultâneo de três técnicas distintas (ICE Score, Matriz de Quadrantes Esforço × Valor e MoSCoW).
* **Issue #77: Justificar a exclusão de RF17 do MVP:** Apontamento do professor indicando uma inconsistência funcional grave no planejamento do produto. O *RF15 (Emitir certificado)* havia sido colocado dentro do MVP, enquanto o *RF17 (Validar certificado)* foi deixado de fora. Como o produto tem forte relação com a certificação de atividades voluntárias, o sistema emitiria documentos digitais sem disponibilizar o mecanismo de validação pública para as instituições de ensino, exigindo uma justificativa formal ou a reclassificação do item.
* **Issue #78: Apresentar o cronograma atualizado do projeto:** Cobrança do professor pela ausência de um cronograma atualizado e pela falta de informações claras sobre o progresso real das atividades planejadas até o momento. A equipe precisava publicar a nova versão do planejamento e deixar visível o percentual de execução de cada entrega.

---

## 12.2 Solução Implementada a Cada Issue 

### Unidade 1

#### Solução para a Issue #1 (Objetivos Específicos do Produto x Características de Produto)
* Criação de duas tabelas, uma de Objetivos Específicos, outra de Caracsterísticas do produto.
* O conjunto de Objetivos Específicos (OEs) e Características de Produto (CPs) foi revisado e consolidado, agrupando os itens que estavam em nível de abstração muito baixo.
* Itens operacionais específicos como controle de frequência e geração de PDFs foram elevados para conceitos mais amplos dentro das características estratégicas do produto.
* Garantiu-se o alinhamento do projeto, assegurando que cada Característica de Produto mantida no documento fosse mapeada e desdobrada em, no mínimo, dois requisitos (RFs ou RNFs) na lista de especificações.

#### Solução para a Issue #3 (Estratégias de Engenharia de Software)
* O quadro comparativo entre as estratégias de processo de software foi totalmente revisado e aprofundado, eliminando redundâncias onde as práticas do Extreme Programming (XP) se sobrepunham de forma idêntica em ambos os modelos.
* A fundamentação sobre rastreabilidade foi corrigida: removeu-se a premissa de que o quadro Kanban garante rastreabilidade por si só, documentando explicitamente que a amarração entre requisitos, histórias de usuário, decisões de arquitetura, critérios de aceitação, código e testes é realizada por meio de tags, labels, UUIDs e ferramentas integradas ao ecossistema de desenvolvimento.
* O fluxo de colaboração e validação com o cliente foi refinado para diferenciar com precisão o modelo focado no fluxo contínuo puxado (Kanban) da dinâmica baseada em ciclos de tempo fixos com ritos de revisão ao final de iterações (Scrum).


#### Solução para a Issue #4 (Atividades e Técnicas de ER)
* O quadro de Atividades de ER foi reestruturado com a adição de novas técnicas complementares nas disciplinas críticas do projeto:
  * **Análise e Consenso:** Expansão além do MoSCoW com novas técnicas de priorização e alinhamento técnico.
  * **Declaração:** Inclusão de novas formas de especificação para dar suporte às Histórias de Usuário.
  * **Verificação & Validação:** Adição de métodos de checagem técnica e de negócio para complementar a simples demonstração de protótipos.
* O *GitHub Projects* foi removido da listagem de técnicas e reclassificado corretamente na seção de ferramentas de apoio do projeto.

#### Solução para a Issue #5 (Engenharia de Requisitos e KanbanXP)
* A estrutura baseada em fases rígidas foi completamente eliminada do documento. O processo foi remodelado em uma matriz baseada em "Momento/Prática no KanbanXP", associando o fluxo visual às disciplinas de Engenharia de Requisitos e engenharia do Extreme Programming (XP).
* Foram detalhadas e anexadas as políticas de trabalho explícitas (gerenciamento de limites de WIP, regras de transição de colunas e sistema *pull*) e os critérios de qualidade necessários para os incrementos de software.

#### Solução para a Issue #6 (Cronograma e Entregas)
* Os dois planejamentos conflitantes foram eliminados e unificados em um único plano de entregas centrado nas dinâmicas de fluxo contínuo do KanbanXP.
* A estrutura das entregas foi totalmente remodelada: as tarefas de configuração de ambiente e infraestrutura foram diluídas ao longo do projeto, sendo executadas sob demanda à medida que cada funcionalidade necessita delas, em vez de ficarem concentradas em um bloco isolado.
* O cronograma foi reestruturado em 4 Releases incrementais e cumulativas, onde cada marco de entrega foca estritamente em gerar valor direto para os usuários finais (Estudantes, Organizações e Administrador), distribuídas da seguinte forma:
  * **R1 — Fundação:** Foco em cadastro, autenticação segura e moderação de perfis pelo administrador.
  * **R2 — Perfis e Conexão:** Foco na edição de perfis, visualização de oportunidades e fluxo inicial de candidatura.
  * **R3 — Gestão e Triagem:** Foco no ciclo operacional completo das vagas (CRUD), triagem pelas ONGs e suporte técnico para acessos concorrentes e responsividade mobile.
  * **R4 — Certificação:** Foco no encerramento do ciclo, englobando controle de frequência, registro de horas e emissão automatizada do PDF com código verificador de autenticidade.

#### Solução para a Issue #7 (Composição da Equipe)
* A documentação da equipe foi reescrita para deixar explícito e mandatório que 100% dos membros do grupo acumulam e exercem a função de Analista de Requisitos durante o ciclo de vida do projeto.
* Todas as descrições dos papéis técnicos e operacionais foram revisadas, detalhadas e expandidas para refletir com precisão as responsabilidades reais de cada integrante no ecossistema de desenvolvimento.

### Unidade 2

#### Solução para a Issue #71 (Consolidar a rastreabilidade em uma visão integrada)
* Foi criado um artefato centralizador e exclusivo em `docs/projeto/rastreabilidade.md` para consolidar toda a árvore de engenharia de requisitos do projeto em uma única visão integrada.
* A estrutura foi montada seguindo uma abordagem *top-down* canônica, permitindo o rastreamento em cascata de ponta a ponta: *Problema → Objetivos Específicos (OE) → Características de Produto (CP) → Requisitos Funcionais (RF) → Histórias de Usuário (US) → Requisitos Não Funcionais (RNF)*.
* O novo documento foi estruturado em cinco seções analíticas:
  * Diagrama e mapeamento conceitual da Cadeia de Rastreabilidade;
  * Detalhamento dos Problemas Identificados (P01 e P02);
  * Alinhamento dos Objetivos Específicos (OE01 e OE02);
  * Matriz completa de Engenharia cruzando os dados por Características de Produto (CP01, CP02 e CP03);
  * Tabela de correlação de Requisitos Não Funcionais explicitando quais Requisitos Funcionais são impactados por cada restrição técnica ou de qualidade.
* A página foi devidamente indexada no arquivo de sumário do `mkdocs.yml` para publicação oficial no GitHub Pages do projeto.

#### Solução para a Issue #72 (Refinar os Requisitos Não Funcionais)
* Todos os 9 Requisitos Não Funcionais do projeto foram reescritos na documentação, recebendo critérios objetivos, matemáticos e técnicos para garantir sua total testabilidade através de métricas claras:
  * **RNF01 (Segurança de Criptografia):** Definição do uso do algoritmo *bcrypt* com *work factor* mínimo de 12 (alinhado às diretrizes do OWASP), garantindo um tempo médio de ~250ms por hash para proteção contra ataques de força bruta sem degradar a experiência de uso.
  * **RNF02 (Performance de Login):** Fixação do limite de tempo de resposta em até 2 segundos, medido sob uma carga simulada de 100 requisições simultâneas.
  * **RNF03 (Validação de Documento):** Vinculação explícita ao algoritmo oficial de checagem de dígitos verificadores da Receita Federal (Regex e cálculo matemático de validação de CNPJ), integrado diretamente nas camadas de modelo do serviço de usuários.
  * **RNF04 (Compatibilidade de Plataforma):** Especificação de suporte restrito a versões estáveis: iOS 16 ou superior e Android 10 (API 29) ou superior, prevendo responsividade em telas com largura mínima de 360px (cobertura de mais de 95% do mercado e compatível com o Expo SDK do frontend).
  * **RNF05 (Tempo de Busca):** Definição de tempo de resposta máximo de 3 segundos para buscas complexas utilizando até 5 filtros simultâneos, sob uma carga de 200 requisições.
  * **RNF06 (Disponibilidade e Concorrência):** Estabelecimento do teto de 5 segundos de resposta sob testes de estresse de até 1.000 usuários simultâneos na plataforma.
  * **RNF07 (Geração de Relatórios):** Especificação de processamento assíncrono para a geração de PDFs em até 30 segundos, utilizando arquitetura de filas de tarefas em *background*.
  * **RNF08 (Imutabilidade de Dados):** Detalhamento dos mecanismos de segurança física e lógica, aplicando travas de banco de dados (`RESTRICT/NO UPDATE/DELETE`) combinadas a validações rígidas na camada de aplicação para impedir a alteração de certificados gerados.
  * **RNF09 (Identificadores Únicos):** Adoção de chaves primárias baseadas em UUID v4 conforme a RFC 4122 para blindagem de URLs e prevenção de colisões de ID no banco de dados.

#### Solução para a Issue #73 (Documentar o padrão de identificação das histórias de usuário)
* Foi adicionada uma subseção de governança no início do Backlog do Produto detalhando a convenção de nomenclatura e a estrutura lógica por trás de cada identificador.
* O padrão visual foi reestruturado de forma semântica, associando cada História de Usuário (US) diretamente à sua Feature (FT) e Épico (EP) de origem (ex: EP01-FT01-US01).

#### Solução para a Issue #75 (Corrigir inconsistências na identificação dos requisitos)
* Foi realizada uma auditoria de rastreabilidade em todo o Backlog do Produto para eliminar a colisão de identificadores que gerava duplicidade oculta de tarefas no fluxo.
* Corrigiu-se o erro de versões anteriores em que códigos alfanuméricos provisórios (como `US002.1b` a `US002.1d`) haviam sido mapeados por cima de numerações já existentes (de `RF08` a `RF10`), mascarando requisitos distintos sob a mesma ID.
* Toda a sequência lógica do bloco de Ciclo de Vagas (CP02) foi renumerada e estabilizada de forma linear, realocando os Requisitos Funcionais originais para IDs únicas e exclusivas no banco de dados do projeto.
* Padronizou-se em definitivo a nomenclatura limpa no formato `US2.x` em todas as referências cruzadas e matrizes de rastreabilidade do documento, garantindo consistência integral e eliminando qualquer código legado ou desatualizado.

#### Solução para a Issue #76 (Priorização do Backlog e MVP)
* A seção de Priorização do Backlog foi completamente revisada para detalhar o fluxo operacional de ordenação e a governança das técnicas.
* Foi criada uma subseção chamada "Método Principal: Decisão do Time", estabelecendo formalmente que o comitê humano da equipe detém a palavra final, utilizando as ferramentas matemáticas como suporte analítico e não como regras automáticas de descarte.
* Adicionou-se uma tabela explicativa definindo o papel exato e o escopo de decisão de cada técnica: o MoSCoW definindo o enquadramento no MVP, o ICE Score ranqueando os itens e a Matriz Esforço × Valor tratando a viabilidade técnica e o retorno de negócio.
* Foi introduzida uma seção específica de "Regras de Conflito" mapeando 4 cenários clássicos de divergência de classificação entre as ferramentas (anomalias), documentando como o grupo resolve esses impasses.
* Os critérios subjetivos de impacto foram substituídos por métricas objetivas de negócio, e a ordenação do backlog passou a ser tratada como referência dinâmica, ao invés de uma fila rígida e imutável de implementação.

#### Solução para a Issue #77 (Justificar a exclusão de RF17 do MVP)
* Foi adicionada uma nota técnica e formal de justificativa na seção de priorização do Backlog do Produto (Seção 10.3) detalhando a estratégia de engenharia adotada pelo grupo através de dois argumentos principais:
  1. **Dependência técnica sequencial:** A validação pública exige, obrigatoriamente, a existência prévia de certificados emitidos no banco de dados. Portanto, o *RF17* só gera valor real após o *RF15* estar consolidado em ambiente de produção, tornando inviável antecipar o esforço de codificação no MVP sem massa de dados para sustentá-lo.
  2. **Análise quantitativa pelo ICE Score:** O *RF17* obteve a menor pontuação do bloco de certificação (CP03), com score de 0,75. Isso ocorreu devido ao alto esforço de desenvolvimento estimado (nota 8) combinado à baixa confiança inicial (nota 0,6) sobre o volume de acessos externos de validação no primeiro momento do sistema.
* O *RF17* foi formalmente reclassificado como *Should Have* (Desejável) e alocado estrategicamente para a **Release R4** do cronograma.
* Para mitigar os riscos e garantir a extensão futura, o **RNF09 (Uso de UUID v4)** foi mantido ativo já no MVP, garantindo que todos os certificados emitidos na primeira fase nascerão com os códigos necessários salvos no banco para a validação pública posterior.

#### Solução para a Issue #78 (Apresentar o cronograma atualizado do projeto)
* O documento de cronograma (`docs/projeto/cronograma.md`) foi expandido e atualizado com dados reais de progresso por meio de duas novas seções:
  * **Seção 5.2 (Status de Execução):** Introdução de uma legenda formal de acompanhamento (*Em produção*, *Implementado no repositório*, *Em andamento* e *Planejado*) acompanhada do percentual exato de conclusão de cada marco, apontando **R1: 100%**, **R2: 55%**, **R3: 5%** e **R4: 0%** (totalizando cerca de 52% do MVP executado).
  * **Seção 5.3 (Spike de Infraestrutura):** Documentação técnica de um *Spike* de pesquisa focado no provisionamento da infraestrutura na AWS. Foram descritas 13 atividades com evidências de entrega (envolvendo EC2, RDS, Nginx, Gunicorn, S3, Docker, chaves SSH e Deploy automatizado) para justificar o desvio de prazo e o esforço de aprendizado da equipe em nuvem durante a primeira release.