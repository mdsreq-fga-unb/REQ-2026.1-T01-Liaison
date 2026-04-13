# 2 SOLUÇÃO PROPOSTA

## 2.1 Objetivo Geral do Produto

Aumentar a conexão entre estudantes universitários e oportunidades de voluntariado. O sucesso é definido por viabilizar uma jornada de ponta a ponta da descoberta da vaga à certificação, eliminando barreiras de comunicação e centralizando a gestão para as organizações. O produto terá entregue valor quando o ciclo completo da publicação da vaga à emissão do certificado ocorrer inteiramente dentro do sistema.

## 2.2 Objetivos Específicos (OE) do Produto

| ID | Objetivo Específico |
| :--- | :--- |
| OE01 | Facilitar a busca e a descoberta de oportunidades de voluntariado compatíveis com o perfil e a disponibilidade do estudante. |
| OE02 | Permitir que organizações cadastrem, publiquem e gerenciem suas oportunidades de voluntariado de forma autônoma. |
| OE03 | Automatizar a emissão de certificados digitais de participação ao término das atividades, integrando os dados de presença registrados. |
| OE04 | Prover mecanismos de controle de presença e participação dos voluntários nas atividades cadastradas. |

## 2.3 Características de Produto

A tabela a seguir lista as características do produto, cada uma descrita em termos do comportamento observável que habilita, do objetivo específico que endereça e do indicador que permitirá verificar se a característica está entregando o valor esperado.

| ID | Característica | Descrição resumida | OE principal | Contrib. secundária | Valor entregue e indicador de sucesso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CP01 | Cadastro | Permite o registro de estudantes e organizações na plataforma, com coleta e armazenamento de informações para identificação, personalização da experiência e uso das funcionalidades. | OE02 | OE01, OE04 | A plataforma mantém base estruturada de usuários e organizações, possibilitando personalização da experiência e operação das demais funcionalidades. |
| CP02 | Gestão de oportunidades | Permite que organizações criem, atualizem e disponibilizem oportunidades de voluntariado, incluindo suas informações essenciais. | OE02 | OE01 | As organizações conseguem gerenciar suas oportunidades de forma centralizada na plataforma. |
| CP03 | Descoberta de oportunidades | Permite que estudantes encontrem oportunidades de voluntariado disponíveis de acordo com seus interesses e contexto de uso. | OE01 | — | O estudante consegue localizar oportunidades relevantes dentro da plataforma. |
| CP04 | Inscrição em atividades | Fluxo de candidatura do estudante à vaga, com confirmação ou recusa pela organização. | OE01 | OE02 | Desburocratiza o processo de adesão ao voluntariado e facilita a gestão de inscrições pelas organizações. |
| CP05 | Controle de presença | Registro de frequência dos voluntários nas atividades, gerenciado pela organização responsável. | OE04 | OE03 | Rastreabilidade dos dados necessários para emissão de certificados e validação acadêmica. |
| CP06 | Emissão de certificados | Geração e envio digital de certificado de participação ao estudante ao término da atividade, contendo carga horária registrada. | OE03 | OE01 | Valor acadêmico direto para o estudante; principal diferencial da plataforma. |

## 2.4 Tecnologias a Serem Utilizadas

A arquitetura tecnológica do Liaison foi escolhida com foco em três pilares: viabilizar um MVP multiplataforma, suportar múltiplos perfis de acesso de forma segura e acelerar o desenvolvimento colaborativo dentro de um semestre. A stack selecionada inclui:

*   **Frontend (React + Expo):** Permite compilar a aplicação para Android, iOS e Web a partir de um único código-base em JavaScript. É a escolha ideal para focar no público universitário (que acessa prioritariamente via smartphone) e reduzir a complexidade da configuração.
*   **Backend (Django + Django REST Framework):** Estrutura o sistema através de uma API REST. O Django foi selecionado por resolver nativamente as maiores complexidades do projeto: já traz sistema de autenticação integrado, controle de acesso por perfis (Aluno, ONG, Admin) e painel administrativo.
*   **Banco de Dados (PostgreSQL):** Banco de dados relacional robusto, ideal para suportar operações simultâneas de diferentes perfis. Destaca-se pelo suporte nativo a UUID e JSON, formatos cruciais para a emissão e validação rastreável dos certificados digitais em PDF.
*   **Ambiente e Colaboração (Docker + Git):** O ambiente de desenvolvimento será isolado em containers (Docker Compose) para garantir que o código rode de forma idêntica nas máquinas de todos os desenvolvedores da equipe. O versionamento será gerido via Git/GitHub, integrando o GitHub Pages para a documentação do projeto.

## 2.5 Pesquisa de Mercado e Análise Competitiva

**O Tamanho do Desafio e a Oportunidade**

O mercado de voluntariado no Brasil possui um volume expressivo e uma demanda acadêmica represada. Segundo dados do IBGE, cerca de 7,2 milhões de pessoas já realizaram atividades voluntárias no país. Paralelamente, o ensino superior brasileiro conta com mais de 9 milhões de matrículas ativas, com um crescimento contínuo de 5,6% entre 2022 e 2023 (Semesp).

Com as novas diretrizes curriculares do MEC (como a curricularização da extensão), uma grande parcela desses 9 milhões de estudantes é obrigada a cumprir horas práticas e complementares. Na prática, isso cria um ecossistema gigante de universitários precisando de oportunidades válidas, colidindo com ONGs que precisam urgentemente de mão de obra, mas não têm tempo para lidar com burocracia.

**O Abismo nas Soluções Atuais**

Apesar do cenário promissor, a pesquisa de mercado revela que as soluções disponíveis hoje resolvem apenas fatias isoladas do problema, deixando um vácuo no atendimento direto ao universitário. As plataformas atuais dividem-se em três grandes grupos falhos para esse propósito:

1.  **Portais de Vagas e Redes Sociais (Ex: Atados, Transforma Brasil, VOL)**
    *   **O que fazem:** Conectam voluntários a organizações de forma fácil, com base em causas e localização geográfica.
    *   **A falha:** Possuem foco muito genérico (ou voltado ao voluntariado corporativo/ESG). Não têm ferramentas reais de validação de presença prática e não geram certificados com a validade formal que as secretarias acadêmicas exigem (a documentação costuma ser apenas simbólica).
2.  **Sistemas de Gestão Interna de ONGs (Ex: Bússola Social)**
    *   **O que fazem:** São excelentes ERPs (sistemas de gestão) para as ONGs organizarem suas métricas e funcionários internamente.
    *   **A falha:** São sistemas fechados ("back-office"). Não funcionam como um ambiente aberto de descoberta de vagas e não ajudam a atrair a massa de estudantes que precisam cumprir horas.
3.  **Plataformas Acadêmicas Fechadas (Ex: Plataforma A, SIGEX)**
    *   **O que fazem:** Atendem às exigências formais de certificação das próprias faculdades e do governo.
    *   **A falha:** São extremamente burocráticos e travados (operam no modelo B2B estrito). Uma ONG de bairro dificilmente consegue furar o bloqueio para divulgar uma vaga nesses sistemas. O acesso depende da área de TI da instituição de ensino, tornando o processo lento e pouco amigável.

**O Nosso Diferencial Competitivo**

A nossa solução nasce exatamente para preencher essa lacuna de mercado, atuando como um SaaS independente, focado 100% no estudante universitário, sem as amarras das integrações de TI institucionais.

Ao invés de tentar plugar o sistema diretamente no Ministério da Educação ou nas secretarias das faculdades (o que gera dependência e lentidão no lançamento), a plataforma resolve o problema com extrema eficiência e autonomia:

*   **Conexão sem atritos:** O estudante encontra a ONG com a facilidade de uma rede social, buscando ativamente por causas e carga horária disponível.
*   **Presença em 1 clique:** Eliminamos a complexidade de bater ponto com GPS. A validação de presença é única e feita pela própria ONG (que atesta a participação) ao final da ação.
*   **Emissão Automatizada:** Após a validação, a plataforma gera automaticamente um Certificado em PDF completo para o estudante.
*   **Autonomia Total:** O aluno simplesmente baixa o documento e faz o encaminhamento por conta própria para a sua Instituição de Ensino Superior (IES).

Mais do que apenas aproximar partes, a proposta entrega uma ponte direta, segura e livre de burocracias acadêmicas de TI, resolvendo a dor imediata do aluno de conseguir suas horas e a dor da ONG de comprovar o trabalho sem perder horas com papelada.

## 2.6 Viabilidade da Proposta

A proposta é viável no contexto da disciplina, considerando a clareza do problema a ser resolvido, o escopo enxuto definido e a possibilidade de entrega incremental de um MVP funcional ao final do semestre. Embora a equipe seja reduzida e ainda esteja em processo de consolidação do domínio sobre algumas tecnologias, o projeto foi estruturado de forma compatível com essa realidade, adotando uma arquitetura de SaaS independente que isenta a necessidade de integrações complexas com sistemas acadêmicos externos neste primeiro momento.

O principal risco técnico está na modelagem e separação correta de perfis (Aluno vs. ONG) e na geração segura do certificado em formato PDF, mas esse risco é mitigado pela divisão incremental das entregas, pela simplificação do fluxo de validação (um clique ao final da ação) e pela adoção de uma pilha tecnológica amplamente difundida no desenvolvimento.

Assim, a proposta é considerada viável, desde que:

*   O escopo do MVP permaneça controlado, focado estritamente na conexão e na geração do comprovante em PDF;
*   As prioridades sejam mantidas, evitando a adição de integrações B2B prematuras; e
*   A equipe preserve a estratégia de aprendizado contínuo e validação rápida ao longo do desenvolvimento.

## 2.7 Benefícios Esperados

O Projeto foi pensado para gerar valor para todos os envolvidos.

Para os **estudantes**, o principal ganho é acabar com a bagunça na hora de procurar voluntariado. Em vez de depender de grupos de WhatsApp, murais ou sites desatualizados, eles conseguem encontrar oportunidades que fazem sentido para o seu perfil e para a sua rotina em um único lugar. E, quando a atividade termina, o certificado já é gerado automaticamente com a carga horária registrada, pronto para ser entregue, sem burocracia nem necessidade de correr atrás depois.

Para as **organizações** do terceiro setor, a plataforma substitui um conjunto improvisado de ferramentas que muita gente usa hoje, como formulários, planilhas e grupos de mensagem. Tudo passa a ficar centralizado em um único sistema, com controle de inscrições, presença e histórico dos voluntários.

Para as **instituições de ensino**, o ganho está na organização e na transparência. As atividades dos estudantes ficam registradas com dados de frequência e carga horária, o que torna a validação das horas de extensão bem mais simples e confiável.

A tendência é que mais estudantes se envolvam em atividades de impacto social, não só por obrigação, mas porque o processo ficou mais simples e mais acessível.
