# 10 BACKLOG DO PRODUTO

Aqui, cabe destacar que todas as histórias de usuários relacionadas, a seguir, são derivadas da lista de requisitos funcionais apresentados, anteriormente, neste documento. Esta é uma lista preliminar e deverá sofrer ajustes sempre que necessário, durante o desenvolvimento do produto Liaison.

## 10.1 Backlog Geral

A tabela, a seguir, apresenta cada um dos requisitos funcionais (RFs) declarados utilizando a técnica de user story (US), assim como a rastreabilidade com os requisitos não funcionais (RNFs).

**Convenção de numeração das User Stories (US):**
A numeração das User Stories segue o padrão `US<CP#>.<sequencial>`, vinculando cada história diretamente à Característica de Produto que ela implementa (ver [2.3 Características de Produto](solucao.md#23-caracteristicas-de-produto)):
- O primeiro dígito (`CP#`) referencia a Característica de Produto correspondente: **CP01** (Gestão de Usuários e Entidades), **CP02** (Ciclo de Vagas e Engajamento) ou **CP03** (Acompanhamento e Certificação Acadêmica).
- O número sequencial identifica cada história dentro da sua respectiva Característica de Produto, na ordem lógica de implementação.

**Exemplos:**
- `US1.3` → terceira user story da **CP01** (Autenticar usuário).
- `US2.5` → quinta user story da **CP02** (Buscar vaga).
- `US3.1` → primeira user story da **CP03** (Listar aprovados).

| RF | User Story derivada | CP vinculada | RNFs relacionados |
| :--- | :--- | :---: | :--- |
| **RF01 Cadastrar estudante** | **US1.1** Como estudante universitário, desejo me cadastrar na plataforma para poder buscar e me candidatar a vagas de voluntariado. | CP01 | RNF01, RNF02 |
| **RF02 Cadastrar organização** | **US1.2** Como representante de uma organização social, desejo cadastrar minha organização na plataforma para poder publicar vagas de voluntariado. | CP01 | RNF01, RNF03 |
| **RF03 Autenticar usuário** | **US1.3** Como usuário (estudante, organização ou administrador), desejo fazer login na plataforma de forma segura para acessar funcionalidades específicas do meu perfil. | CP01 | RNF01, RNF02 |
| **RF04 Gerenciar perfil** | **US1.4** Como estudante, desejo gerenciar e editar meu perfil para manter minhas informações atualizadas e relevantes para oportunidades de voluntariado.<br><br>**US1.5** Como organização, desejo editar meu perfil institucional para manter as informações da organização atualizadas e atrativas para estudantes voluntários. | CP01 | RNF04 |
| **RF05 Recuperar senha** | **US1.6** Como usuário, desejo recuperar minha senha via e-mail para poder acessar minha conta caso esqueça a senha. | CP01 | RNF01 |
| **RF06 Moderar organização** | **US1.7** Como administrador (Sysmin), desejo ter um painel para moderar cadastros de organizações sociais para garantir a legitimidade das organizações na plataforma. | CP01 | RNF04 |
| **RF18 Criar oportunidade** | **US2.1** Como organização, desejo criar novas vagas de voluntariado para atrair estudantes interessados em participar das atividades da organização. | CP02 | RNF04, RNF06 |
| **RF19 Editar oportunidade** | **US2.2** Como organização, desejo editar informações de vagas de voluntariado existentes para mantê-las atualizadas. | CP02 | RNF04 |
| **RF20 Publicar oportunidade** | **US2.3** Como organização, desejo publicar vagas de voluntariado para que fiquem visíveis aos estudantes. | CP02 | RNF04 |
| **RF21 Encerrar oportunidade** | **US2.4** Como organização, desejo encerrar vagas de voluntariado quando não houver mais necessidade. | CP02 | RNF04 |
| **RF08 Buscar vaga** | **US2.5** Como estudante, desejo buscar e filtrar vagas de voluntariado para encontrar oportunidades que correspondam ao meu interesse e disponibilidade. | CP02 | RNF04, RNF05, RNF06 |
| **RF09 Consultar vaga** | **US2.6** Como estudante, desejo visualizar os detalhes completos de uma vaga de voluntariado para decidir se devo me candidatar. | CP02 | RNF04 |
| **RF10 Realizar candidatura** | **US2.7** Como estudante, desejo me candidatar a uma vaga de voluntariado ativa para participar das atividades da organização. | CP02 | RNF04, RNF06 |
| **RF11 Avaliar candidatura** | **US2.8** Como organização, desejo avaliar as candidaturas dos estudantes para aprovar ou recusar participantes nas vagas de voluntariado. | CP02 | RNF04, RNF06 |
| **RF12 Acompanhar candidatura** | **US2.9** Como estudante, desejo cancelar minha candidatura a uma vaga de voluntariado caso não tenha mais interesse ou disponibilidade.<br><br>**US2.10** Como usuário, desejo receber notificações sobre mudanças de status de candidaturas para me manter informado em tempo hábil. | CP02 | RNF04 |
| **RF13 Listar aprovados** | **US3.1** Como organização, desejo visualizar a lista de estudantes aprovados para cada atividade de voluntariado para gerenciar o acompanhamento e a presença. | CP03 | RNF04, RNF08 |
| **RF14 Registrar frequência** | **US3.2** Como organização, desejo registrar a presença e atestar a carga horária dos estudantes aprovados para documentar a participação nas atividades. | CP03 | RNF04, RNF08 |
| **RF15 Emitir certificado** | **US3.3** Como estudante, desejo receber automaticamente meu certificado digital em PDF ao concluir uma atividade de voluntariado.<br><br>**US3.4** Como estudante, desejo exportar meus certificados digitais em formato PDF para comprovação acadêmica. | CP03 | RNF07, RNF08, RNF09 |
| **RF16 Consultar histórico** | **US3.5** Como estudante, desejo visualizar meu histórico de horas de voluntariado para acompanhar minha evolução.<br><br>**US3.6** Como estudante, desejo fazer download dos meus certificados de voluntariado para comprovação acadêmica. | CP03 | RNF04, RNF07, RNF08 |
| **RF17 Validar certificado** | **US3.7** Como qualquer pessoa, desejo acessar um portal público para validar a autenticidade de um certificado por meio de URL ou QR Code. | CP03 | RNF07, RNF09 |

## 10.2 Priorização do Backlog

A priorização de requisitos é um dos maiores desafios no desenvolvimento de produtos e projetos. Para lidar com essa complexidade, a equipe adotou um ecossistema de três frameworks utilizados em conjunto, formando um **Funil de Priorização** robusto que elimina o "achismo" e protege a equipe de armadilhas analíticas.

### 10.2.1 O Funil de Priorização: MoSCoW + ICE Score + Matriz Esforço x Valor

O segredo está na ordem de aplicação. MoSCoW, ICE Score e Matriz Esforço x Valor não são métodos concorrentes, mas sim **três peneiras sequenciais** com propósitos distintos e complementares.

#### Passo 1: O Filtro de Negócio — MoSCoW

Antes de qualquer análise quantitativa, o MoSCoW atua como "segurança da porta", estabelecendo o que é vital para o negócio:

- **Must have (Deve ter):** Inegociável. Sem isso, não há lançamento do produto.
- **Should have (Deveria ter):** Importante, mas o produto sobrevive sem ele por um tempo.
- **Could have (Poderia ter):** "Nice to have" — perfumaria ou luxo.
- **Won't have (Não terá agora):** Ideias descartadas para este ciclo.

**Ação prática:** Congelam-se os "Won't have" e prioriza-se a alocação de tempo sempre respeitando a hierarquia. Um *Could have* jamais deve tirar o lugar de um *Must have*.

#### Passo 2: A Quantificação e Desempate — ICE Score

Uma vez que os itens estão classificados no MoSCoW, aplica-se o ICE Score para desempatar os itens dentro de cada categoria (ex.: qual dos cinco *Must haves* faremos primeiro?). Cada requisito recebe uma nota nos três eixos:

- **Impact (Impacto — I):** Quanto valor esse item gera para o negócio ou usuário? (Escala de 1 a 10)
- **Confidence (Confiança — C):** Qual a certeza da equipe sobre essas estimativas? Dados comprovados geram alta confiança; suposições geram baixa confiança. (Escala de 0,1 a 1,0)
- **Effort (Esforço — E):** Qual a complexidade estimada de implementação? Muito fácil = 1; Muito difícil = 10. (Escala de 1 a 10)

**Fórmula de cálculo:**
```
ICE Score = (Impacto × Confiança) / Esforço
```

O resultado numérico cria uma fila de trabalho lógica dentro de cada faixa do MoSCoW: itens com maior impacto e confiança, combinados com menor esforço, recebem as pontuações mais altas.

#### Passo 3: A Visualização e Validação — Matriz Esforço x Valor

Por fim, as notas de Impacto e Esforço são convertidas em coordenadas visuais para alinhar a equipe e os stakeholders:

- **Eixo Vertical (Valor):** Nota de **Impacto (I)**.
- **Eixo Horizontal (Esforço):** Nota de **Esforço (E)** — quanto maior o esforço, mais à direita o item aparece.

|  | **Baixo Esforço**<br>(E ≤ 5) | **Alto Esforço**<br>(E ≥ 6) |
|---|---|---|
| **Alto Impacto**<br>(I ≥ 6) | **Quick Wins** — prioridade máxima de execução | **Major Projects** — precisam ser fatiados |
| **Baixo Impacto**<br>(I ≤ 5) | **Fill-ins** — tarefas rápidas para preencher tempo ocioso | **Thankless Tasks** — poço de perda de tempo e dinheiro; descartar |

> **Importante — Limitação do Funil:** O Funil de Priorização ordena os itens exclusivamente por valor estratégico (MoSCoW) e pela relação esforço/impacto (ICE + Matriz). Ele **não considera dependências técnicas ou de negócio** entre os itens. Cabe ao planejamento da execução (sprint planning) ajustar a sequência quando um item depende de outro. 

---

### 10.2.2 Passo 1 Aplicado — Classificação MoSCoW Inicial

Nesta etapa, **antes de qualquer cálculo numérico**, a equipe classificou os 29 requisitos exclusivamente por critério de negócio. A pergunta-guia foi: *"O produto funciona sem este item no lançamento?"* O resultado é uma decisão estratégica pura, sem interferência de esforço ou complexidade técnica.

#### Must Have (Deve ter) — 18 itens

Itens inegociáveis. Sem eles, a plataforma não entrega a proposta de valor mínima.

| ID | Descrição | Justificativa de negócio |
| :--- | :--- | :--- |
| RF06 | Moderar organização | Única forma de garantir a legitimidade das organizações na plataforma; sem isso, não há confiança no sistema. |
| RF10 | Realizar candidatura | Ato central da conexão estudante-vaga; sem candidatura, a plataforma não cumpre seu propósito. |
| RF11 | Avaliar candidatura | Permite às organizações aprovarem ou recusarem inscrições; essencial para fechar o ciclo de engajamento. |
| RNF01 | Criptografia de senhas (bcrypt) | Requisito de segurança obrigatório; armazenar senhas em texto plano é inaceitável em qualquer cenário. |
| RNF04 | Interface responsiva (iOS e Android) | O público universitário acessa prioritariamente via smartphone; sem responsividade, o alcance é nulo. |
| RF03 | Autenticar usuário | Porta de entrada para todos os perfis; sem login, não há sessão, perfil ou personalização. |
| RF09 | Consultar vaga | O estudante precisa ver os detalhes da vaga antes de decidir se candidatar; informação insuficiente gera abandono. |
| RF13 | Listar aprovados | A organização precisa saber quem são os voluntários confirmados para gerenciar presença e atividades. |
| RF20 | Publicar oportunidade | A vaga criada precisa ficar visível; sem publicação, não há descoberta pelos estudantes. |
| RF02 | Cadastrar organização | Sem organizações cadastradas, não há vagas publicadas; é um dos dois lados do marketplace. |
| RF12 | Acompanhar candidatura | O estudante precisa saber o status da sua inscrição; a transparência reduz ansiedade e tickets de suporte. |
| RF14 | Registrar frequência | A presença registrada pela ONG é a base de dados para emissão de certificados; sem ela, o certificado não tem lastro. |
| RF01 | Cadastrar estudante | Sem estudantes cadastrados, não há candidatos; é o outro lado do marketplace. |
| RF04 | Gerenciar perfil | Dados desatualizados prejudicam o matching e a comunicação; perfis completos aumentam a taxa de aprovação. |
| RF19 | Editar oportunidade | Correções em vagas são inevitáveis; sem edição, a organização precisa excluir e recriar, gerando retrabalho. |
| RF08 | Buscar vaga | A descoberta de oportunidades é o primeiro passo da jornada do estudante; sem busca, a navegação é inviável. |
| RF15 | Emitir certificado | É a entrega de valor acadêmico concreto ao estudante; o certificado materializa o propósito do produto. |
| RF18 | Criar oportunidade | Origem de todo o ciclo de vagas; sem criação, não há o que publicar, buscar ou gerenciar. |

#### Should Have (Deveria ter) — 6 itens

Importantes para a qualidade do produto, mas o MVP sobrevive sem eles no lançamento inicial. Planejados para a segunda iteração de desenvolvimento.

| ID | Descrição | Justificativa de negócio |
| :--- | :--- | :--- |
| RNF03 | Validação de CNPJ | Melhora a qualidade cadastral das organizações, mas não bloqueia o fluxo principal — a moderação humana (RF06) já atua como filtro. |
| RNF02 | Login em até 2 segundos | Performance desejável, mas o MVP com volume controlado de usuários não sofrerá com lentidão crítica. |
| RNF05 | Busca em até 3 segundos | Performance desejável; a busca funciona mesmo com tempo de resposta superior no MVP. |
| RNF06 | Suporte a 1.000 usuários simultâneos | Escala é uma preocupação de crescimento, não de lançamento; o MVP opera com volume reduzido. |
| RF21 | Encerrar oportunidade | Conveniência operacional para a ONG; a vaga pode expirar naturalmente por data sem o botão de encerramento. |
| RF16 | Consultar histórico | Visualização consolidada de horas e certificados; cada certificado individual já serve como comprovante no MVP. |

#### Could Have (Poderia ter) — 3 itens

Funcionalidades desejáveis que agregam qualidade, mas podem ser postergadas sem comprometer o valor central.

| ID | Descrição | Justificativa de negócio |
| :--- | :--- | :--- |
| RNF09 | UUIDs para certificados | Aumenta a segurança e a rastreabilidade dos certificados, mas o PDF já funciona com identificador sequencial no MVP. |
| RF17 | Validar certificado | Portal público de validação agrega credibilidade para as IES, mas o MVP pode operar sem esse canal externo. |
| RNF08 | Imutabilidade de certificados | Garante a integridade dos registros emitidos; importante, mas implementável como reforço pós-MVP. |

#### Won't Have (Não terá agora) — 2 itens

Ideias conscientemente descartadas para este ciclo. O baixo valor gerado não justifica o esforço.

| ID | Descrição | Justificativa de negócio |
| :--- | :--- | :--- |
| RF05 | Recuperar senha | Fluxo auxiliar de suporte; no MVP, a recuperação pode ser tratada manualmente pela equipe ou por e-mail administrativo. |
| RNF07 | Geração assíncrona de PDFs | Otimização de performance; a geração síncrona de PDFs atende perfeitamente o volume do MVP. |

---

### 10.2.3 Passos 2 e 3 Aplicados — ICE Score e Matriz Esforço x Valor

Com a classificação MoSCoW definida, a equipe atribuiu notas de Impacto (I), Confiança (C) e Esforço (E) aos 29 requisitos. Aplicando a fórmula `ICE = (I × C) / E`, cada item recebeu uma pontuação. Em seguida, os itens foram distribuídos na **Matriz Esforço x Valor** conforme os valores de Impacto (eixo vertical) e Esforço (eixo horizontal).

Os quatro quadrantes resultantes estão apresentados abaixo, com ordenação por Score ICE decrescente.

#### Quick Wins (Alto Impacto, Baixo Esforço) — 19 itens

| ID | Descrição | I | C | E | ICE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| RF06 | Moderar organização | 10 | 1,0 | 1 | 10,00 |
| RF10 | Realizar candidatura | 10 | 1,0 | 1 | 10,00 |
| RF11 | Avaliar candidatura | 10 | 1,0 | 1 | 10,00 |
| RNF01 | Criptografia de senhas (bcrypt) | 10 | 1,0 | 1 | 10,00 |
| RNF04 | Interface responsiva (iOS e Android) | 10 | 1,0 | 1 | 10,00 |
| RF03 | Autenticar usuário | 10 | 1,0 | 2 | 5,00 |
| RF09 | Consultar vaga | 10 | 1,0 | 2 | 5,00 |
| RF13 | Listar aprovados | 10 | 1,0 | 2 | 5,00 |
| RF20 | Publicar oportunidade | 10 | 1,0 | 2 | 5,00 |
| RNF02 | Login em até 2 segundos | 10 | 0,9 | 2 | 4,50 |
| RNF05 | Busca em até 3 segundos | 10 | 0,9 | 2 | 4,50 |
| RNF06 | Suporte a 1.000 usuários simultâneos | 10 | 0,8 | 2 | 4,00 |
| RF21 | Encerrar oportunidade | 8 | 0,9 | 2 | 3,60 |
| RF02 | Cadastrar organização | 10 | 1,0 | 3 | 3,33 |
| RF16 | Consultar histórico | 6 | 1,0 | 2 | 3,00 |
| RNF09 | UUIDs para certificados | 10 | 0,6 | 2 | 3,00 |
| RF12 | Acompanhar candidatura | 6 | 0,8 | 2 | 2,40 |
| RF14 | Registrar frequência | 7 | 1,0 | 3 | 2,33 |
| RF08 | Buscar vaga | 10 | 0,8 | 5 | 1,60 |

#### Major Projects (Alto Impacto, Alto Esforço) — 7 itens

| ID | Descrição | I | C | E | ICE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| RF01 | Cadastrar estudante | 10 | 1,0 | 6 | 1,67 |
| RF04 | Gerenciar perfil | 10 | 1,0 | 6 | 1,67 |
| RF19 | Editar oportunidade | 10 | 1,0 | 6 | 1,67 |
| RF15 | Emitir certificado | 10 | 1,0 | 7 | 1,43 |
| RF18 | Criar oportunidade | 10 | 1,0 | 9 | 1,11 |
| RF17 | Validar certificado | 10 | 0,6 | 8 | 0,75 |
| RF05 | Recuperar senha | 6 | 0,8 | 8 | 0,60 |

#### Fill-ins (Baixo Impacto, Baixo Esforço) — 2 itens

| ID | Descrição | I | C | E | ICE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| RNF03 | Validação de CNPJ | 5 | 1,0 | 1 | 5,00 |
| RNF08 | Imutabilidade de certificados | 4 | 0,7 | 4 | 0,70 |

#### Thankless Tasks (Baixo Impacto, Alto Esforço) — 1 item

| ID | Descrição | I | C | E | ICE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| RNF07 | Geração assíncrona de PDFs | 2 | 0,5 | 7 | 0,14 |

---

### 10.2.4 O Perigo do ICE "Cego" e Análise de Anomalias

O maior cuidado que se deve ter com o ICE Score é que **a matemática não tem contexto de negócios**. Se aplicado isoladamente, o ICE pode levar a decisões equivocadas. É por isso que o **MoSCoW é a trava de segurança**: ele garante que itens vitais sejam feitos independentemente de terem um ICE Score temporariamente mais baixo devido à complexidade.

Abaixo, a equipe analisou o backlog priorizado em busca de anomalias — situações em que os números brutos do ICE poderiam induzir a decisões erradas se não fossem interpretados com a lógica do Funil.

---

#### A. Falsos Quick Wins — Itens para Discovery

Itens que caíram no quadrante Quick Win (Alto Impacto, Baixo Esforço), mas cuja **Confiança é baixa** — sinal de que a equipe está estimando com base em suposições, não em dados.

| ID | Descrição | I | C | E | ICE | Diagnóstico | Ação recomendada |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **RNF09** | UUIDs para certificados | 10 | 0,6 | 2 | 3,00 | Baixa segurança nas estimativas (C=0,6). Sem dados concretos que sustentem I=10 e E=2. | Discovery (PoC) |
| **RF08** | Buscar vaga | 10 | 0,8 | 5 | 1,60 | Certeza razoável (C=0,8), mas incerteza sobre performance com múltiplos filtros e volume de dados. | Discovery |

---

#### B. Major Projects que Precisam de Fatiamento (Slicing)

Itens de Alto Impacto e Alto Esforço que **não devem ser descartados**, mas sim quebrados em partes menores. O fatiamento transforma frações do projeto grande em Quick Wins viáveis, reduzindo risco e aumentando a Confiança.

| ID | Descrição | I | C | E | ICE | Diagnóstico | Ação recomendada |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **RF18** | Criar oportunidade | 10 | 1,0 | 9 | 1,11 | Item mais complexo (E=9). Formulário rico + validações + preview + publicação. | Fatiar |
| **RF17** | Validar certificado | 10 | 0,6 | 8 | 0,75 | E=8 + C=0,6. Estimativas frágeis; cairia no esquecimento sem o Funil. | Discovery + fatiar. Após PoC do RNF09. |
| **RF15** | Emitir certificado | 10 | 1,0 | 7 | 1,43 | Alta complexidade (E=7). PDF com dados dinâmicos, download e reemissão. | Fatiar |
| **RF01** | Cadastrar estudante | 10 | 1,0 | 6 | 1,67 | Esforço E=6. Formulário + validações + upload + integração c/ autenticação. | Fatiar |
| **RF04** | Gerenciar perfil | 10 | 1,0 | 6 | 1,67 | Dois contextos: perfil estudante e perfil organização. | Fatiar por persona |
| **RF19** | Editar oportunidade | 10 | 1,0 | 6 | 1,67 | Depende de RF18 (reutiliza formulário de criação). | Fatiar após RF18 |

---

#### C. Fill-in com ICE Elevado — Oportunidade Tática

Itens do quadrante Fill-in (Baixo Impacto, Baixo Esforço) que, por serem muito fáceis e bem conhecidos, obtiveram ICE superior a vários Must Have. A leitura correta é usá-los como "respiro" da equipe, sem desviar o foco do que é vital.

| ID | Descrição | I | C | E | ICE | Diagnóstico | Ação recomendada |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **RNF03** | Validação de CNPJ | 5 | 1,0 | 1 | 5,00 | ICE 5,00 > 14 Must Have. Tarefa trivial (E=1) e bem conhecida (C=1,0). | Filler |

---

### 10.2.5 Backlog Final Priorizado (Funil Completo)

A tabela abaixo é o resultado da aplicação completa do Funil de Priorização: **MoSCoW como ordenação primária + ICE Score como desempate dentro de cada faixa**, com as observações de anomalias incorporadas. Esta é a ordem de execução recomendada para o desenvolvimento do produto Liaison.

| # | ID | Descrição | MoSCoW | Quadrante | I | C | E | ICE | Observação |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | RF06 | Moderar organização | Must | Quick Win | 10 | 1,0 | 1 | 10,00 | |
| 2 | RF10 | Realizar candidatura | Must | Quick Win | 10 | 1,0 | 1 | 10,00 | |
| 3 | RF11 | Avaliar candidatura | Must | Quick Win | 10 | 1,0 | 1 | 10,00 | |
| 4 | RNF01 | Criptografia de senhas (bcrypt) | Must | Quick Win | 10 | 1,0 | 1 | 10,00 | |
| 5 | RNF04 | Interface responsiva (iOS e Android) | Must | Quick Win | 10 | 1,0 | 1 | 10,00 | |
| 6 | RF03 | Autenticar usuário | Must | Quick Win | 10 | 1,0 | 2 | 5,00 | |
| 7 | RF09 | Consultar vaga | Must | Quick Win | 10 | 1,0 | 2 | 5,00 | |
| 8 | RF13 | Listar aprovados | Must | Quick Win | 10 | 1,0 | 2 | 5,00 | |
| 9 | RF20 | Publicar oportunidade | Must | Quick Win | 10 | 1,0 | 2 | 5,00 | |
| 10 | RF02 | Cadastrar organização | Must | Quick Win | 10 | 1,0 | 3 | 3,33 | |
| 11 | RF12 | Acompanhar candidatura | Must | Quick Win | 6 | 0,8 | 2 | 2,40 | |
| 12 | RF14 | Registrar frequência | Must | Quick Win | 7 | 1,0 | 3 | 2,33 | |
| 13 | RF01 | Cadastrar estudante | Must | Major Project | 10 | 1,0 | 6 | 1,67 | Fatiar (ver 10.2.4-B) |
| 14 | RF04 | Gerenciar perfil | Must | Major Project | 10 | 1,0 | 6 | 1,67 | Fatiar (ver 10.2.4-B) |
| 15 | RF19 | Editar oportunidade | Must | Major Project | 10 | 1,0 | 6 | 1,67 | Fatiar (ver 10.2.4-B) |
| 16 | RF08 | Buscar vaga | Must | Quick Win | 10 | 0,8 | 5 | 1,60 | Discovery (ver 10.2.4-A) |
| 17 | RF15 | Emitir certificado | Must | Major Project | 10 | 1,0 | 7 | 1,43 | Fatiar (ver 10.2.4-B) |
| 18 | RF18 | Criar oportunidade | Must | Major Project | 10 | 1,0 | 9 | 1,11 | Fatiar (ver 10.2.4-B) |
| 19 | RNF03 | Validação de CNPJ | Should | Fill-in | 5 | 1,0 | 1 | 5,00 | Filler tático (ver 10.2.4-C) |
| 20 | RNF02 | Login em até 2 segundos | Should | Quick Win | 10 | 0,9 | 2 | 4,50 | |
| 21 | RNF05 | Busca em até 3 segundos | Should | Quick Win | 10 | 0,9 | 2 | 4,50 | |
| 22 | RNF06 | Suporte a 1.000 usuários simultâneos | Should | Quick Win | 10 | 0,8 | 2 | 4,00 | |
| 23 | RF21 | Encerrar oportunidade | Should | Quick Win | 8 | 0,9 | 2 | 3,60 | |
| 24 | RF16 | Consultar histórico | Should | Quick Win | 6 | 1,0 | 2 | 3,00 | |
| 25 | RNF09 | UUIDs para certificados | Could | Quick Win | 10 | 0,6 | 2 | 3,00 | Discovery (ver 10.2.4-A) |
| 26 | RF17 | Validar certificado | Could | Major Project | 10 | 0,6 | 8 | 0,75 | Discovery + fatiar (ver 10.2.4-B) |
| 27 | RNF08 | Imutabilidade de certificados | Could | Fill-in | 4 | 0,7 | 4 | 0,70 | |
| 28 | RF05 | Recuperar senha | Won't | Major Project | 6 | 0,8 | 8 | 0,60 | |
| 29 | RNF07 | Geração assíncrona de PDFs | Won't | Thankless Task | 2 | 0,5 | 7 | 0,14 | |

> **Leitura da tabela:** As posições #1 a #18 compõem o **MVP (Must Have)**. As posições #19 a #24 são os **Should Have**, previstos para a segunda iteração. As posições #25 a #27 são os **Could Have**, a serem executados conforme disponibilidade. As posições #28 e #29 são os **Won't Have**, descartados para este ciclo. Itens com observações possuem recomendações detalhadas na seção [10.2.4](#1024-o-perigo-do-ice-cego-e-analise-de-anomalias).

---

## 10.3 MVP (Minimum Viable Product)

O MVP é composto pelos 18 itens classificados como **Must Have**, correspondentes às posições #1 a #18 da tabela consolidada acima. Este conjunto cobre os fluxos essenciais dos três perfis de usuário:

| Perfil | Fluxos cobertos pelo MVP |
| :--- | :--- |
| **Estudante** | Cadastro, login, busca de vagas, visualização de detalhes, candidatura, acompanhamento de status, recebimento de certificado |
| **Organização** | Cadastro (com moderação), login, criação/edição/publicação de vagas, avaliação de candidaturas, registro de frequência |
| **Administrador** | Moderação de cadastros de organizações |

Total de itens no MVP: **18** (16 RFs + 2 RNFs).

## 10.4 Anexos de Priorização

Abaixo estão os documentos de apoio utilizados pela equipe durante as sessões de priorização:

### Matriz de Priorização
![Matriz de Priorização](assets/Matriz.pdf){ type="application/pdf" width="100%" height="800" }

### Priorização MoSCoW
![Priorização MoSCoW](assets/MoSCoW.pdf){ type="application/pdf" width="100%" height="800" }
