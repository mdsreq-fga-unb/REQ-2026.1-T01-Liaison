# 11 Regras de Negócio do MVP

Este documento formaliza as **regras de negócio** que governam o comportamento do sistema Liaison. Cada regra foi derivada dos requisitos funcionais, não funcionais e das histórias de usuário do [Backlog do Produto](backlog_produto.md), e reflete as decisões tomadas pela equipe em conjunto com o cliente.

> **Convenção de numeração:** `RN<##>` — Regra de Negócio sequencial global.  
> **Rastreabilidade:** Cada regra indica os RFs, RNFs e USs que a fundamentam.

---

## 11.1 Aprovação e Moderação de Organizações

Regras que controlam o ciclo de vida do cadastro de organizações sociais na plataforma, desde o registro inicial até a aprovação ou rejeição pelo administrador.

**Rastreabilidade:** RF02 (Cadastrar organização), RF07 (Moderar organização), US1.2, US1.7, RNF03.

| ID | Regra de Negócio | Justificativa |
| :--- | :--- | :--- |
| **RN01** | Toda organização cadastrada inicia com status **"pendente"** e conta **inativa** (`is_active=false`). | Garante que nenhuma organização publique vagas sem antes passar pela triagem do administrador (US1.7). |
| **RN02** | Organização com status "pendente" ou "rejeitada" **não pode autenticar-se** na plataforma. | O login só é liberado após aprovação administrativa, protegendo estudantes de organizações não verificadas (US1.3, US1.7). |
| **RN03** | Somente usuários com papel **administrador** podem aprovar, rejeitar ou solicitar informações adicionais de uma organização. | Restrição de acesso baseada em papel (role-based access control) para proteger o fluxo de moderação (US1.7). |
| **RN04** | A **aprovação** de uma organização altera seu status para "aprovado" e ativa a conta (`is_active=true`), permitindo login e publicação de vagas. | Transição de estado que libera o acesso completo da organização à plataforma (US1.7). |
| **RN05** | A **rejeição** de uma organização altera seu status para "rejeitado", mantém a conta inativa e **exige justificativa obrigatória** por parte do administrador. | A justificativa garante transparência e permite que a organização corrija problemas e solicite novo cadastro (US1.7). |
| **RN06** | A ação de **"solicitar informações"** exige uma mensagem obrigatória do administrador e **não altera** o status da organização (permanece "pendente"). | Permite ao administrador pedir esclarecimentos sem aprovar ou rejeitar prematuramente (US1.7). |
| **RN07** | Toda ação de moderação (aprovação, rejeição, solicitação de informações) é registrada em **log de auditoria** contendo: administrador responsável, organização alvo, tipo de ação, detalhes e data/hora. | Trilha de auditoria para prestação de contas e rastreabilidade de decisões administrativas (US1.7). |
| **RN08** | O **CNPJ** deve ser validado algoritmicamente (dígitos verificadores) e ser **único** no sistema. O CNPJ é armazenado apenas como dígitos (sem máscara). | Garante a legitimidade e unicidade do cadastro de organizações (RNF03, US1.2). |
| **RN09** | O **e-mail** da organização deve ser único no sistema e não pode ser alterado após o cadastro. | Previne duplicidade de contas e garante integridade do identificador de login (US1.2). |

---

## 11.2 Publicação e Encerramento de Oportunidades

Regras que controlam o ciclo de vida das vagas de voluntariado, desde a criação em rascunho até o encerramento.

**Rastreabilidade:** RF21 (Criar oportunidade), RF22 (Editar oportunidade), RF23 (Publicar oportunidade), RF24 (Encerrar oportunidade), US2.1, US2.2, US2.3, US2.4.

| ID | Regra de Negócio | Justificativa |
| :--- | :--- | :--- |
| **RN10** | Somente organizações com status **"aprovado"** podem criar oportunidades de voluntariado. | Impede que organizações pendentes ou rejeitadas publiquem vagas na plataforma (RN01, RN04, US2.1). |
| **RN11** | Uma oportunidade pode ser salva como **rascunho** com campos parcialmente preenchidos. Rascunhos **não são visíveis** para estudantes. | Permite que a organização construa a vaga progressivamente antes de publicá-la (US2.1). |
| **RN12** | Para **publicação**, todos os campos obrigatórios devem estar preenchidos: título, área, descrição, modalidade, datas de início e término, e carga horária semanal. Se a modalidade for presencial ou híbrida, o endereço/local é obrigatório. | Garante que estudantes tenham todas as informações necessárias para tomar decisão de candidatura (US2.3, US2.6). |
| **RN13** | Uma oportunidade publicada fica visível para **todos os estudantes** cadastrados na plataforma e pode ser encontrada via busca. | Atende ao objetivo de conectar estudantes e organizações de forma centralizada (OE01, US2.3, US2.5). |
| **RN14** | Somente a **organização criadora** da oportunidade pode editá-la, publicá-la ou encerrá-la. | Controle de propriedade que impede que uma organização altere vagas de outra (US2.2, US2.4). |
| **RN15** | A **edição** de uma oportunidade publicada mantém seu status ativo; já a edição de um rascunho mantém o status de rascunho. A organização pode reeditar os campos de uma vaga ativa a qualquer momento. | Permite ajustes sem necessidade de republicação, mantendo a visibilidade para estudantes (US2.2). |
| **RN16** | O **encerramento** de uma oportunidade altera seu status para "encerrada" e **impede novas candidaturas**. Candidaturas existentes mantêm seu status atual. | O encerramento não prejudica candidatos já inscritos, respeitando o compromisso firmado (US2.4). |
| **RN17** | Uma oportunidade encerrada pode ser **reaberta** pela organização criadora, voltando a aceitar candidaturas. | Oferece flexibilidade caso a organização precise reativar uma vaga previamente encerrada (US2.4). |

---

## 11.3 Candidatura: Duplicidade, Cancelamento e Avaliação

Regras que governam o fluxo de candidatura dos estudantes às vagas de voluntariado, incluindo restrições de duplicidade, possibilidades de cancelamento e critérios de avaliação pela organização.

**Rastreabilidade:** RF10 (Realizar candidatura), RF11 (Avaliar candidatura), RF12 (Cancelar candidatura), RF13 (Notificar candidatura), US2.7, US2.8, US2.9, US2.10.

| ID | Regra de Negócio | Justificativa |
| :--- | :--- | :--- |
| **RN18** | Somente usuários com papel **estudante** podem se candidatar a vagas de voluntariado. | Restrição de papel: organizações e administradores não se candidatam (US2.7). |
| **RN19** | Um estudante **não pode se candidatar mais de uma vez** à mesma oportunidade. A tentativa de candidatura duplicada deve ser bloqueada pelo sistema. | Previne spam de candidaturas e garante integridade dos dados de inscrição (US2.7). |
| **RN20** | Candidatura só é permitida em oportunidades com status **"publicada"** (ativa). Oportunidades em rascunho ou encerradas não aceitam candidaturas. | Garante que o estudante só se inscreva em vagas válidas e visíveis (RN13, RN16, US2.7). |
| **RN21** | A candidatura inicia com status **"pendente"**. Os status possíveis são: `pendente → aprovada`, `pendente → recusada`, `pendente → cancelada`. | Define a máquina de estados da candidatura com transições claras (US2.7, US2.8, US2.9). |
| **RN22** | O estudante pode **cancelar** sua própria candidatura enquanto ela estiver com status "pendente". Candidaturas já aprovadas ou recusadas **não podem** ser canceladas pelo estudante. | O cancelamento é um direito do candidato antes da decisão da organização; após aprovação, o compromisso de frequência já se inicia (US2.9). |
| **RN23** | A organização pode **aprovar ou recusar** candidaturas pendentes. A decisão é individual por candidatura e deve ser feita pela organização responsável pela oportunidade. | Garante que a organização tenha controle sobre quem participa de suas atividades (US2.8). |
| **RN24** | Mudanças de status de candidatura (aprovação, recusa, cancelamento) devem gerar **notificação** para o estudante afetado. | Mantém o estudante informado em tempo hábil sobre o andamento de suas candidaturas (US2.10). |
| **RN25** | Caso a organização **encerre** uma oportunidade, candidaturas com status "pendente" permanecem pendentes, mas novas candidaturas são bloqueadas (conforme RN16). | Preserva candidaturas já realizadas sem comprometer o encerramento da vaga (RN16, US2.4). |

---

## 11.4 Registro de Frequência e Carga Horária

Regras que controlam o registro de presença e a contabilização de horas de voluntariado dos estudantes aprovados em atividades.

**Rastreabilidade:** RF14 (Listar aprovados), RF15 (Registrar frequência), US3.1, US3.2, RNF08.

| ID | Regra de Negócio | Justificativa |
| :--- | :--- | :--- |
| **RN26** | Somente a organização responsável pela oportunidade pode registrar frequência e atestar carga horária dos estudantes. | Controle de propriedade: uma organização não pode registrar frequência em vagas de outra (US3.2). |
| **RN27** | O registro de frequência só é permitido para estudantes cuja candidatura foi **aprovada** na oportunidade correspondente. | Apenas participantes efetivamente aceitos podem ter presença registrada (RN21, US3.1, US3.2). |
| **RN28** | Cada registro de frequência deve conter, no mínimo: **data da atividade**, **carga horária** (em horas) e **descrição da atividade** realizada. | Garante a rastreabilidade e a validade do registro para fins de comprovação acadêmica (US3.2). |
| **RN29** | A carga horária registrada deve ser um valor **positivo** e coerente (valores zerados ou negativos são rejeitados). | Impede registros inválidos que comprometam a integridade dos dados de horas (US3.2). |
| **RN30** | Registros de frequência são **imutáveis** após a criação. Uma vez atestada, a frequência não pode ser editada nem excluída. | Requisito de segurança que garante a confiabilidade dos dados para emissão de certificados (RNF08, US3.2). |
| **RN31** | A organização pode visualizar a **lista completa de estudantes aprovados** para cada oportunidade, incluindo status de frequência e total de horas acumuladas. | Facilita o gerenciamento de acompanhamento e presença por parte da organização (US3.1). |

---

## 11.5 Emissão e Imutabilidade de Certificados

Regras que controlam a geração, integridade e validação dos certificados digitais de voluntariado emitidos pela plataforma.

**Rastreabilidade:** RF16 (Emitir certificado), RF17 (Compartilhar certificado), RF18 (Consultar histórico), RF19 (Compartilhar histórico), RF20 (Validar certificado), US3.3, US3.4, US3.5, US3.6, US3.7, RNF07, RNF08, RNF09.

| ID | Regra de Negócio | Justificativa |
| :--- | :--- | :--- |
| **RN32** | O certificado digital é **gerado automaticamente** pelo sistema quando a organização finaliza/conclui o registro de frequência de um estudante em uma atividade. | Automatiza o fluxo de certificação, eliminando a necessidade de solicitação manual (US3.3). |
| **RN33** | Cada certificado recebe um identificador único no formato **UUID v4** (conforme RFC 4122), que serve como código de autenticidade. | Garante unicidade global e previne falsificação de certificados (RNF09, US3.7). |
| **RN34** | O certificado é gerado em formato **PDF** e deve conter, no mínimo: nome completo do estudante, nome da organização, título da atividade, carga horária total, período de realização (datas), UUID de autenticidade e data de emissão. | Garante que o certificado contenha todas as informações necessárias para comprovação acadêmica perante instituições de ensino (US3.3, US3.4). |
| **RN35** | Certificados emitidos são **imutáveis**. Após a emissão, o conteúdo do certificado não pode ser alterado, editado nem excluído por nenhum usuário do sistema (incluindo administradores). | Requisito crítico de segurança e confiabilidade: o certificado é um documento comprobatório e sua integridade deve ser garantida (RNF08). |
| **RN36** | O estudante pode **fazer download** de seus certificados em PDF a qualquer momento pelo seu perfil ou histórico de atividades. | Garante acesso permanente aos comprovantes acadêmicos (US3.4, US3.6). |
| **RN37** | O estudante pode **consultar seu histórico** de horas de voluntariado, visualizando o total acumulado, as atividades realizadas e os certificados emitidos. | Permite o acompanhamento da evolução acadêmica em relação às horas de extensão exigidas pela instituição (US3.5, Resolução CNE/CES nº 7/2018). |
| **RN38** | A autenticidade de um certificado pode ser **verificada publicamente** por qualquer pessoa através de URL ou QR Code contendo o UUID, sem necessidade de login. | Permite que instituições de ensino e terceiros validem a legitimidade do certificado de forma independente (US3.7, RNF09). |

---

## 11.6 Regras Transversais (Validação e Segurança)

Regras de negócio que se aplicam de forma transversal a múltiplos módulos do sistema.

| ID | Regra de Negócio | Justificativa | Rastreabilidade |
| :--- | :--- | :--- | :--- |
| **RN39** | Senhas devem ter no mínimo **8 caracteres** e conter **letras e números**. São armazenadas com criptografia bcrypt (work factor ≥ 12). | Política de segurança de credenciais (RNF01). | RF01, RF02, RF03, RNF01 |
| **RN40** | O **e-mail** do usuário é o identificador único de login para estudantes e administradores. Para organizações, o login pode ser feito via **CNPJ**. | Define os identificadores de autenticação por tipo de usuário (US1.3). | RF03, US1.3 |
| **RN41** | A **matrícula** do estudante deve ser única no sistema. | Previne duplicidade de registros acadêmicos (US1.1). | RF01, US1.1 |
| **RN42** | Toda criação de usuário (estudante ou organização) e seu perfil correspondente é realizada de forma **atômica** (transação). Se qualquer etapa falhar, todo o cadastro é revertido. | Garante consistência dos dados: não há usuário sem perfil nem perfil sem usuário (US1.1, US1.2). | RF01, RF02 |

---

## 11.7 Referência Cruzada: Regras × Critérios de Aceitação das USs

A tabela abaixo mapeia cada regra de negócio às User Stories cujos critérios de aceitação devem incorporar a respectiva regra.

| Regra | User Stories Impactadas | Área |
| :--- | :--- | :--- |
| RN01–RN09 | US1.2, US1.3, US1.7 | Moderação de Organizações |
| RN10–RN17 | US2.1, US2.2, US2.3, US2.4, US2.5, US2.6 | Oportunidades |
| RN18–RN25 | US2.7, US2.8, US2.9, US2.10 | Candidaturas |
| RN26–RN31 | US3.1, US3.2 | Frequência e Carga Horária |
| RN32–RN38 | US3.3, US3.4, US3.5, US3.6, US3.7 | Certificação |
| RN39–RN42 | US1.1, US1.2, US1.3 | Validação e Segurança |

> **Nota:** Para cada US listada acima, os cenários de aceitação (formato *Dado / Quando / Então*) devem validar explicitamente as regras de negócio associadas. Exemplo: o cenário de aceitação de US2.7 (candidatura) deve incluir caso de teste para candidatura duplicada (RN19) e para candidatura em vaga encerrada (RN20).

---

## Histórico de Versões

| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 30/06/2026 | 0.1 | Criação do documento com regras RN01–RN42 | Davi (auslogyc) |
