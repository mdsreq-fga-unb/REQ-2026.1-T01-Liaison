# 9. Definição de Pronto (DoR) e Definição de Concluído (DoD)

## 9.1 Contextualização do Fluxo de Trabalho

Para organizar o desenvolvimento do nosso projeto utilizando a metodologia **KanbanXP**, a nossa equipe estabeleceu critérios práticos para controlar a entrada e a saída de tarefas no nosso quadro de trabalho. Precisamos garantir duas coisas básicas: que ninguém comece a programar algo que não foi bem entendido e que nenhuma funcionalidade seja entregue incompleta ou sem testes. 

Para isso, usamos duas ferramentas principais:
- **DoR (Definition of Ready):** É o nosso combinado do que uma história de usuário ou requisito precisa ter para que a gente possa puxá-la para a coluna *Em Desenvolvimento (In Progress)*. Se faltar informação ou o escopo estiver confuso, a tarefa não entra no fluxo.
- **DoD (Definition of Done):** É o nosso checklist de qualidade técnica e de negócio. Uma funcionalidade só sai de *Em Desenvolvimento* e vai para *Concluído (Done)* se passar por todos esses pontos, garantindo que o código entregue seja confiável.

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

### 9.2.2 Critérios de DoR Específicos por Requisito

| ID do Requisito | Critério de Entrada Específico (Pronto para Iniciar) | Verificação |
| :--- | :--- | :---: |
| **RF01** (Estudante) | O layout da tela de cadastro de aluno está validado e o RNF04 (responsividade mobile) está incluído nos critérios de aceitação. | Sim/Não |
| **RF02** (Organização) | Os campos necessários para o envio de dados das entidades parceiras estão listados (casando com a checagem do RNF03). | Sim/Não |
| **RF03** (Autenticar) | O fluxo de login e tratamento de erros está desenhado, incluindo a restrição de tempo do RNF02 (2 segundos). | Sim/Não |
| **RF04** (Perfil) | Estão definidos quais dados, formatos de foto e preferências o usuário poderá editar nesta primeira versão. | Sim/Não |
| **RF05** (Senha) | O fluxo de envio do link/token para o e-mail de recuperação de credenciais está totalmente desenhado. | Sim/Não |
| **RF06** (Moderar) | Estão claros os status do fluxo de aprovação das ONGs e quais dados o administrador verá na tela de validação. | Sim/Não |
| **RF07** (Gerenciar Vaga) | Os campos obrigatórios de uma vaga (prazos, descrição, requisitos mínimos) foram padronizados no backlog. | Sim/Não |
| **RF08** (Buscar Vaga) | Estão listados todos os filtros personalizados que o estudante poderá aplicar (ex: área, horário, local). | Sim/Não |
| **RF09** (Consultar Vaga) | Está definido o layout da página de detalhes da vaga, garantindo que todas as informações geradas no RF07 apareçam. | Sim/Não |
| **RF10** (Candidatura) | O comportamento do sistema para quando o aluno clica em "Confirmar Interesse" está mapeado (regras de impedimento). | Sim/Não |
| **RF11** (Avaliar Cand.) | Estão prontas as regras de notificação para o aluno quando a ONG alterar o status dele para aprovado ou recusado. | Sim/Não |
| **RF12** (Acompanhar) | O painel do estudante está desenhado, mostrando visualmente a linha do tempo ou status de cada inscrição ativa. | Sim/Não |
| **RF13** (Listar Aprov.) | O design do painel de voluntários confirmados para a ONG está fechado, prevendo a paginação da lista. | Sim/Não |
| **RF14** (Frequência) | Está definido como a ONG vai inserir as horas (se por dia, por semana ou consolidadas no final da vaga). | Sim/Não |
| **RF15** (Certificado) | O template visual do certificado em PDF está pronto e aprovado pelo grupo. | Sim/Não |
| **RF16** (Histórico) | O layout do painel consolidado do aluno está desenhado, prevendo a soma das horas e a listagem de links dos PDFs. | Sim/Não |
| **RF17** (Validar Cert.) | A regra de busca pública por UUID/Código sem exigir login do visitante está desenhada e validada. | Sim/Não |
| **RNF01** (Criptografia) | A biblioteca de hash (ex: bcrypt) e a estratégia de salt para as senhas foram definidas pela equipe de backend. | Sim/Não |
| **RNF02** (Perf. Login) | A estratégia de indexação do banco de dados na tabela de usuários para otimizar o login foi planejada. | Sim/Não |
| **RNF03** (Valida CNPJ) | O algoritmo/expressão regular (Regex) para validação matemática do formato do CNPJ foi escolhido. | Sim/Não |
| **RNF04** (Usabilidade) | Os breakpoints de design para as telas mobile (iOS e Android) foram configurados no CSS/Framework. | Sim/Não |
| **RNF05** (Perf. Busca) | A estrutura de dados e os índices de busca no banco para as vagas (RF08) foram previamente modelados. | Sim/Não |
| **RNF06** (Carga Vagas) | A infraestrutura local ou ambiente de testes foi configurado para suportar simulações de acessos simultâneos. | Sim/Não |
| **RNF07** (Assincronismo) | A tecnologia de mensageria ou biblioteca de filas em segundo plano (background jobs) foi integrada ao projeto. | Sim/Não |
| **RNF08** (Imutabilidade)| A estratégia de restrição física ou lógica no banco de dados para travar o update/delete foi acordada na equipe. | Sim/Não |
| **RNF09** (UUID) | A biblioteca geradora de UUIDv4 padrão mercado foi instalada e testada no ambiente de desenvolvimento. | Sim/Não |

---

## 9.3 DoD — Definição de Pronto para Concluir

Para garantir a qualidade técnica do que estamos entregando na disciplina, uma funcionalidade só sai da coluna *In Progress* para a coluna *Done* se passar no escrutínio de todos os critérios gerais e cumprir o seu critério de qualidade específico.

### 9.3.1 Critérios Gerais de DoD (Técnico e Processo)
* **DoD-G01:** O código foi versionado e está em Pull Request (PR) aberto no repositório do GitHub do projeto.
* **DoD-G02:** O PR passou por Code Review e recebeu a aprovação de pelo menos mais um integrante do grupo.
* **DoD-G03:** Todos os testes automatizados existentes continuam passando no pipeline de CI, sem quebrar funcionalidades antigas.
* **DoD-G04:** Os cenários descritos nos critérios de aceitação foram testados manualmente ou via testes de integração.
* **DoD-G05:** A documentação técnica ou comentários no código foram devidamente atualizados, se aplicável.

### 9.3.2 Critérios de DoD Específicos por Requisito

| ID do Requisito | Critério de Saída Específico (Pronto para Entregar / Concluído) | Verificação |
| :--- | :--- | :---: |
| **RF01** (Estudante) | Cadastro criando o registro no banco com sucesso e enviando um feedback claro de sucesso/erro na tela. | Sim/Não |
| **RF02** (Organização) | Dados salvos com status "Aguardando Moderação" e upload dos documentos da ONG funcionando no storage. | Sim/Não |
| **RF03** (Autenticar) | Login validando as credenciais corretas e bloqueando acessos inválidos de acordo com o planejado. | Sim/Não |
| **RF04** (Perfil) | Alterações persistindo no banco e a foto atualizada carregando instantaneamente na interface do usuário. | Sim/Não |
| **RF05** (Senha) | Token gerado e expirando após o tempo limite configurado; redefinição de senha funcionando de ponta a ponta. | Sim/Não |
| **RF06** (Moderar) | Painel do admin alterando o status da ONG e liberando/bloqueando o acesso dela às funções do sistema. | Sim/Não |
| **RF07** (Gerenciar Vaga) | Fluxo completo de CRUD de vagas operando sem erros no console e refletindo em tempo real no banco. | Sim/Não |
| **RF08** (Buscar Vaga) | Listagem funcionando de forma fluida e aplicando os filtros combinados sem misturar os resultados. | Sim/Não |
| **RF09** (Consultar Vaga) | Página exibindo os dados corretos da vaga selecionada, sem erros de carregamento de dados (NullPointer). | Sim/Não |
| **RF10** (Candidatura) | Registro de vínculo criado na tabela intermediária e o botão desabilitado após a inscrição para evitar duplo clique. | Sim/Não |
| **RF11** (Avaliar Cand.) | Status da inscrição atualizado no banco e histórico gravado para auditoria interna da vaga. | Sim/Não |
| **RF12** (Acompanhar) | Visualização atualizando dinamicamente no painel do aluno assim que a ONG altera a situação da vaga. | Sim/Não |
| **RF13** (Listar Aprov.) | Lista trazendo exatamente os alunos com status "aprovado" vinculados à ID da vaga daquela organização. | Sim/Não |
| **RF14** (Frequência) | Horas salvas e associadas corretamente ao CPF do estudante na vaga específica, sem permitir valores negativos. | Sim/Não |
| **RF15** (Certificado) | PDF sendo gerado em tempo real com os dados dinâmicos recuperados do banco (Nome, ONG, Horas). | Sim/Não |
| **RF16** (Histórico) | Tela calculando a soma exata de horas de todos os certificados válidos do aluno logado. | Sim/Não |
| **RF17** (Validar Cert.) | Consulta retornando "Certificado Válido" com os dados corretos ao inserir um código existente e erro se for falso. | Sim/Não |
| **RNF01** (Criptografia) | Verificado via inspeção no banco de dados que nenhuma senha de usuário está em texto limpo. | Sim/Não |
| **RNF02** (Perf. Login) | Testes de carga manuais/automatizados atestando que a resposta do endpoint de login ficou abaixo de 2 segundos. | Sim/Não |
| **RNF03** (Valida CNPJ) | Testes unitários cobrindo cenários com CNPJs matematicamente inválidos e garantindo o bloqueio do cadastro. | Sim/Não |
| **RNF04** (Usabilidade) | Interface validada visualmente via DevTools simulando telas de dispositivos Android e iOS. | Sim/Não |
| **RNF05** (Perf. Busca) | Tempo de resposta da query de filtragem de vagas verificado no backend, mantendo-se abaixo de 3 segundos. | Sim/Não |
| **RNF06** (Carga Vagas) | Executado teste de estresse simples que comprove a estabilidade da rota com múltiplos acessos simulados simultâneos. | Sim/Não |
| **RNF07** (Assincronismo) | Verificado nos logs do servidor que o processamento do PDF roda em segundo plano e a requisição HTTP retorna imediatamente. | Sim/Não |
| **RNF08** (Imutabilidade)| Testado via console/Postman que requisições de DELETE ou PUT em certificados gerados retornam erro 403/proibido. | Sim/Não |
| **RNF09** (UUID) | Validada a estrutura das URLs públicas e dos códigos gerados para os certificados, confirmando o formato UUID padrão. | Sim/Não |