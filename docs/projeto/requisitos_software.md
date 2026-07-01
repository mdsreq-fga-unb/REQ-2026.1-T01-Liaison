# 8 REQUISITOS DE SOFTWARE

Esta seção descreve os requisitos necessários para o desenvolvimento do software. Ela está dividida em requisitos funcionais e não funcionais, que apresentam as funcionalidades do sistema e as qualidades que ele deve possuir para atender às expectativas dos usuários.

## 8.1 Lista de Requisitos Funcionais

Os requisitos funcionais descrevem as funcionalidades específicas que o sistema deve implementar para atender às necessidades do negócio. Eles incluem integrações, processos e interações do usuário com o sistema.

### CP01 - Gestão de Usuários e Entidades
| ID | Nome do Requisito | Descrição |
| :--- | :--- | :--- |
| **RF01** | Cadastrar estudante | Permitir a criação de conta na plataforma para alunos universitários. |
| **RF02** | Cadastrar organização | Permitir o registro e envio de dados de entidades sociais parceiras. |
| **RF03** | Autenticar usuário | Garantir o acesso seguro à plataforma via login e senha. |
| **RF04** | Gerenciar perfil | Permitir a atualização de dados cadastrais, fotos e preferências. |
| **RF05** | Recuperar senha | Prover um fluxo seguro de redefinição de credenciais de acesso esquecidas. |
| **RF06** | Moderar organização | Permitir a validação e aprovação administrativa dos cadastros de organizações. |

### CP02 - Ciclo de Vagas e Engajamento
| ID | Nome do Requisito | Descrição |
| :--- | :--- | :--- |
| **RF18** | Criar oportunidade | Permitir que organizações criem novas vagas de voluntariado. |
| **RF19** | Editar oportunidade | Permitir que organizações editem vagas de voluntariado existentes. |
| **RF20** | Publicar oportunidade | Permitir que organizações publiquem vagas de voluntariado para visualização dos estudantes. |
| **RF21** | Encerrar oportunidade | Permitir que organizações encerrem vagas de voluntariado. |
| **RF08** | Buscar vaga | Prover listagem de oportunidades com filtros personalizados para o estudante. |
| **RF09** | Consultar vaga | Exibir informações detalhadas, requisitos mínimos e datas de uma vaga específica. |
| **RF10** | Realizar candidatura | Permitir que o estudante confirme interesse e se inscreva em uma vaga. |
| **RF11** | Avaliar candidatura | Permitir que a organização aprove ou recuse inscrições de estudantes nas vagas. |
| **RF12** | Acompanhar candidatura | Permitir que o estudante visualize o status de aprovação de sua inscrição. |

### CP03 - Acompanhamento e Certificação Acadêmica
| ID | Nome do Requisito | Descrição |
| :--- | :--- | :--- |
| **RF13** | Listar aprovados | Exibir o painel de voluntários confirmados na vaga para controle da organização. |
| **RF14** | Registrar frequência | Permitir que a organização ateste as horas efetivamente cumpridas por voluntário. |
| **RF15** | Emitir certificado | Gerar automaticamente o documento oficial em PDF comprovando o voluntariado. |
| **RF16** | Consultar histórico | Exibir painel com o consolidado de certificados e horas totais obtidas pelo estudante. |
| **RF17** | Validar certificado | Prover página pública para terceiros verificarem a autenticidade de um documento via código/UUID. |

---

## 8.2 Lista de Requisitos Não Funcionais

Os requisitos não funcionais especificam as qualidades e restrições do sistema, classificados pelo modelo URPS+.

*   **RNF01 - Segurança (Security):** As senhas dos usuários devem ser armazenadas exclusivamente com o algoritmo **bcrypt**, com fator de custo (work factor) mínimo de **12**, garantindo resistência a ataques de força bruta e proteção contra vazamentos de banco de dados.

*   **RNF02 - Desempenho (Performance):** O processo de login deve retornar resposta ao usuário em no máximo **2 segundos**, medido sob carga nominal de até **100 requisições simultâneas** no ambiente de produção.

*   **RNF03 - Confiabilidade (Reliability):** O sistema deve validar CNPJs inseridos no cadastro de organizações aplicando o **algoritmo oficial de verificação dos dígitos verificadores** da Receita Federal, rejeitando entradas com formatação inválida ou dígitos incorretos antes de persistir os dados.

*   **RNF04 - Usabilidade (Usability):** A interface do sistema deve ser responsiva e totalmente operável em dispositivos móveis com **iOS 16 ou superior** e **Android 10 (API 29) ou superior**, sem quebras de layout ou perda de funcionalidade em telas com largura mínima de **360px**.

*   **RNF05 - Desempenho (Performance):** Os resultados de busca de vagas, com até **5 filtros simultâneos aplicados**, devem ser carregados em menos de **3 segundos**, medido sob carga de até **200 requisições simultâneas** no ambiente de produção.

*   **RNF06 - Desempenho (Performance):** O módulo de vagas deve suportar pelo menos **1.000 usuários navegando e lendo vagas simultaneamente**, com tempo de resposta máximo de **5 segundos** para qualquer requisição de leitura sob essa carga.

*   **RNF07 - Suportabilidade (Supportability):** A geração de certificados em PDF deve ocorrer de forma **assíncrona**, via fila de tarefas em background (ex: Celery + Redis), com tempo máximo de **30 segundos** entre a solicitação e a disponibilização do arquivo para download, sem bloquear a interface do usuário.

*   **RNF08 - Segurança (Security):** Uma vez atestada a carga horária e gerado o certificado digital, os registros correspondentes no banco de dados devem ser **imutáveis** — implementado por meio de restrições no nível do banco (sem permissão de UPDATE/DELETE nas tabelas de certificados e frequências) e validação na camada de aplicação que rejeita qualquer tentativa de alteração.

*   **RNF09 - Confiabilidade (Reliability):** Cada certificado emitido deve receber um identificador único gerado pelo algoritmo **UUID v4** (RFC 4122), utilizado tanto como chave de validação pública quanto como URL de verificação. A probabilidade de colisão do UUID v4 é de aproximadamente 1 em 5,3 × 10³⁶, tornando colisões estatisticamente desprezíveis no volume esperado da plataforma.