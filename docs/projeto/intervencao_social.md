# 3. Intervenção Social

## 3.1 Software como Intervenção Social: Fundamento Conceitual

De acordo com Marsicano (2026), todo software é uma intervenção social. Ao ser introduzido em qualquer contexto de uso — seja uma escola, um hospital, uma comunidade digital, uma organização da sociedade civil ou uma plataforma de comunicação —, ele tende a **alterar práticas, comportamentos, relações, fluxos de informação, formas de coordenação, critérios de decisão, possibilidades de ação e distribuição de autonomia**. Mesmo quando concebido com objetivos aparentemente específicos e delimitados, o software reconfigura o ambiente em que passa a operar: facilita certos modos de agir, dificulta outros, torna determinadas informações mais visíveis, invisibiliza outras, amplia algumas possibilidades e restringe outras.

Essa afirmação é decisiva porque supera uma visão limitada segundo a qual o software apenas automatiza atividades previamente definidas. **Na prática, ele não apenas automatiza; ele reorganiza.** Uma plataforma educacional não apenas disponibiliza conteúdo: ela pode redefinir ritmos de estudo, modos de acompanhamento docente e formas de avaliação. Uma rede social não apenas hospeda interações: ela estrutura visibilidade, circulação de conteúdos e regimes de atenção. Uma plataforma de conexão entre estudantes e organizações sociais não apenas lista vagas: ela intervém na forma como o voluntariado é descoberto, praticado e comprovado academicamente.

Por isso, **os requisitos não são neutros**. Eles incorporam escolhas sobre o que será visível, exigido, permitido, recomendado, bloqueado, monitorado, flexibilizado ou automatizado. Em todos esses casos, a definição do requisito participa da modelagem das condições concretas de experiência e ação dos usuários e dos grupos por eles afetados (MARSICANO, 2026).

A Engenharia de Requisitos deve, portanto, transcender a pergunta tradicional **"o que o sistema deve fazer?"** e também responder a: **"que tipo de intervenção social, humana, institucional ou cultural este sistema tende a produzir?"** (MARSICANO, 2026, p. 112). Essa questão é central porque nem todos os impactos são pretendidos. Alguns efeitos são deliberadamente buscados — como ampliar acesso, facilitar coordenação ou reduzir erros. Outros, porém, emergem do encontro entre o sistema e a prática real de uso, podendo afetar autonomia, privacidade, dependência tecnológica ou qualidade da interação humana de formas não antecipadas.

Distinguir **impactos pretendidos** de **efeitos emergentes** não significa supor que a ER possa prever integralmente o futuro. Significa, antes, reconhecer que ela precisa incorporar consciência sociotécnica, responsabilidade reflexiva e sensibilidade para impactos — explicitando hipóteses, considerando grupos afetados, tornando visíveis trade-offs e favorecendo decisões mais conscientes (MARSICANO, 2026).

---

## 3.2 O Liaison como Intervenção Social

O **Liaison** não é simplesmente uma plataforma de cadastro de vagas de voluntariado. Ao ser introduzido no ecossistema que une estudantes universitários, organizações do terceiro setor (como a igreja do Pastor Valdemir, cliente do projeto) e instituições de ensino superior, ele **intervém ativamente** nas relações entre esses atores — substituindo a fragmentação atual (grupos de WhatsApp, planilhas, murais físicos) por uma infraestrutura centralizada que redistribui visibilidade, automatiza fluxos e reconfigura a forma como o voluntariado é descoberto, gerenciado e comprovado.

Em consequência, falar dos requisitos do Liaison é também falar de transformações concretas na vida social mediada por tecnologia de atores como:

- o **estudante** que hoje busca oportunidades de forma dispersa e solicita documentos manualmente;
- o **Pastor** que hoje gerencia voluntários por WhatsApp e sem controle formal de presença;
- a **IES** que hoje valida horas de extensão com documentos físicos inconsistentes.

---

## 3.3 Impactos Pretendidos

Os impactos pretendidos são os efeitos deliberadamente buscados pela equipe ao projetar a solução — os benefícios que motivaram a concepção do produto e que definem seu sucesso. A tabela abaixo os detalha, relacionando cada impacto às **Características de Produto** (CP) que os materializam:

| Ator Afetado | Impacto Pretendido | Característica de Produto Relacionada |
|---|---|---|
| **Estudante universitário** | Eliminação da busca fragmentada por oportunidades; obtenção automática do comprovante acadêmico sem esforço manual após a atividade. | CP01 – Gestão de Usuários e Entidades; CP02 – Ciclo de Vagas e Engajamento; CP03 – Acompanhamento e Certificação Acadêmica |
| **Organização social (Pastor Valdemir / Igreja)** | Substituição de canais improvisados (WhatsApp, planilhas) por sistema centralizado de publicação de vagas, gestão de inscrições e controle de presença — reduzindo o esforço de coordenação e eliminando a incerteza de "onde encontrar voluntários". | CP02 – Ciclo de Vagas e Engajamento; CP03 – Acompanhamento e Certificação Acadêmica |
| **Instituição de Ensino Superior (IES)** | Melhoria na rastreabilidade e confiabilidade dos registros de extensão universitária, simplificando a validação de horas complementares. | CP03 – Acompanhamento e Certificação Acadêmica |
| **Ecossistema de voluntariado** | Ampliação da conexão entre a obrigatoriedade da extensão acadêmica e a demanda social real das comunidades, gerando um ciclo virtuoso de engajamento. | CP01 – Catálogo centralizado de oportunidades; CP02 – Fluxo de engajamento acadêmico |

---

## 3.4 Efeitos Emergentes Antecipados

Conforme Marsicano (2026), os efeitos emergentes surgem do encontro entre o sistema e a prática real de uso — nem sempre antecipados no momento da concepção, mas plausíveis e merecedores de reflexão. Identificá-los não é transformar a ER em sociologia aplicada, mas exercer a **responsabilidade reflexiva** que a disciplina exige: tornar visíveis trade-offs e antecipar riscos antes que se tornem problemas reais.

### 3.4.1 Efeitos Potencialmente Positivos

**Redução da assimetria tecnológica no terceiro setor:** Pequenas igrejas, ONGs de bairro e entidades comunitárias — como a organização do Pastor Valdemir — ganham acesso a ferramentas de gestão de voluntários que antes eram restritas a entidades com maior capacidade de investimento em tecnologia. O Liaison tem potencial de democratizar essa capacidade de gestão.

**Construção de histórico acadêmico de engajamento social:** O estudante passa a ter um registro consolidado de suas atividades de extensão, com certificados digitais rastreáveis. Além do cumprimento da obrigação curricular, esse histórico pode agregar valor ao currículo e ampliar a consciência do próprio estudante sobre seu impacto nas comunidades atendidas.

**Formalização de relações informais:** A plataforma converte práticas hoje dispersas e não rastreáveis (convites por WhatsApp, presença anotada em papel) em registros estruturados e auditáveis, beneficiando tanto as organizações quanto as IES que precisam comprovar a qualidade das atividades de extensão.

### 3.4.2 Efeitos de Atenção e Mitigação

Os efeitos a seguir foram identificados como riscos plausíveis que, se não considerados nos requisitos, podem gerar consequências negativas para os grupos envolvidos:

| Efeito Emergente Identificado | Descrição do Risco | Ação de Mitigação nos Requisitos |
|---|---|---|
| **Instrumentalização do voluntariado** | O estudante pode focar exclusivamente no "cumprimento de meta" de horas acadêmicas, perdendo o sentido da causa social que motivou o voluntariado. A plataforma pode reduzir uma experiência humana rica a uma transação de horas. | Inserir, na experiência do estudante, elementos de narrativa de impacto (histórias e feedback das organizações pós-atividade), não apenas a contagem de horas acumuladas. |
| **Exclusão digital de líderes comunitários** | Representantes de organizações com menor familiaridade tecnológica — como o Pastor Valdemir — podem se sentir intimidados pelo sistema, resultando em abandono da plataforma e retorno às práticas informais. | Projetar o fluxo de cadastro e gestão da organização com máxima simplicidade, validado diretamente com o cliente em protótipos de baixa fidelidade antes da implementação. |
| **Percepção de vigilância sobre o voluntário** | O registro formal de presença e horas pode gerar nos voluntários a sensação de estarem sendo monitorados, alterando negativamente a experiência e o clima de engajamento espontâneo. | Limitar a coleta de dados ao mínimo necessário (princípio da minimização da LGPD); comunicar com transparência a finalidade do registro; evitar métricas excessivas no perfil do estudante. |
| **Dependência de canal único** | Ao centralizar toda a comunicação e gestão, a plataforma cria uma dependência: se o sistema ficar indisponível, o fluxo de inscrições e comunicação entre estudantes e organizações é interrompido — um risco especialmente relevante para atividades com datas fixas. | Definir requisitos de disponibilidade (SLA), implementar notificações de contingência por e-mail e comunicar proativamente janelas de manutenção. |
| **Informalização da validação acadêmica** | Ao permitir que o estudante baixe e encaminhe autonomamente o certificado para sua IES, a plataforma transfere ao aluno a responsabilidade de verificação — o que pode gerar inconsistências em IES com critérios rígidos de validação. | Documentar claramente as limitações da solução; incluir no certificado gerado todas as informações necessárias para validação (nome, CNPJ da organização, data, carga horária, código rastreável); orientar o estudante sobre o processo de entrega. |

---

## 3.5 Implicações para a Engenharia de Requisitos do Projeto

Reconhecer o Liaison como uma intervenção social reposiciona a responsabilidade da equipe de ER. Conforme Marsicano (2026, p. 113–116), compreender a ER como prática humana, social e sociotécnica produz implicações diretas em todas as suas atividades. No contexto deste projeto, isso se traduz em:

**Na elicitação e descoberta:** Não basta registrar as funcionalidades desejadas pelo Pastor Valdemir. É necessário compreender o contexto de uso real — como o voluntariado se encaixa na rotina do estudante, quais barreiras digitais o líder comunitário enfrenta no cotidiano, e quais grupos serão afetados pela plataforma mesmo sem participar diretamente das reuniões de elicitação. A elicitação situada exige ir além do declarado.

**Na análise e priorização do backlog:** Ao organizar e priorizar as histórias de usuário, a equipe deve equilibrar eficiência técnica com inclusividade — garantindo que a automação não crie barreiras para organizações sem equipe de TI. Priorizar requisitos é tomar decisões sobre valor, risco, impacto e consequências para grupos distintos (MARSICANO, 2026).

**Na declaração e nos critérios de aceitação:** Os critérios de aceitação devem contemplar não apenas a funcionalidade correta, mas também aspectos de privacidade (LGPD), acessibilidade da interface e clareza da comunicação com o usuário. Um requisito pode estar tecnicamente correto e ainda assim ser inadequado para a experiência real dos atores.

**Na verificação e validação:** O sucesso do Liaison não se mede apenas pelo funcionamento técnico, mas pelo feedback do Pastor Valdemir e dos estudantes — verificando se o sistema é, de fato, uma ponte de conexão humana e não uma barreira burocrática adicional. A validação é também social, não apenas técnica.

---

> **Referência de lastro:** Este tópico fundamenta-se nas Seções 5.5.4 ("Software como intervenção social: impactos pretendidos e efeitos emergentes") e 5.5.5 ("Implicações para a prática da Engenharia de Requisitos") do livro **Requisitos de Software – Comunicação é tudo!** (MARSICANO, 2026, p. 112–116).
