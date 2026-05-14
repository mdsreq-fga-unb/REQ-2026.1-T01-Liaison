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
| **RF07** | Gerenciar vaga | Permitir que organizações criem, editem, publiquem e encerrem oportunidades. |
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

Os requisitos não funcionais especificam as qualidades e restrições do sistema, como desempenho, segurança e usabilidade, que não estão diretamente relacionadas às funcionalidades oferecidas, mas são essenciais para garantir a qualidade do software. Utilize o modelo URPS+ para classificar os requisitos não funcionais.

*   **RNF01 - Segurança (Security) :** As senhas dos usuários devem ser armazenadas utilizando algoritmos de criptografia (ex: bcrypt), garantindo total proteção contra vazamentos.
*   **RNF02 - Desempenho (Performance) :** O processo de login deve fornecer uma resposta ao usuário em no máximo 2 segundos.
*   **RNF03 - Confiabilidade (Reliability) :** O sistema deve assegurar a formatação e a validade matemática dos CNPJs inseridos durante o cadastro das organizações sociais.
*   **RNF04 - Usabilidade (Usability) :** A interface do sistema deve ser responsiva e totalmente operável em dispositivos móveis iOS e Android, sem quebras de layout.
*   **RNF05 - Desempenho (Performance) :** Os resultados retornados pelas buscas, mesmo após a aplicação de múltiplos filtros, devem ser carregados em menos de 3 segundos.
*   **RNF06 - Desempenho (Performance) :** O módulo de vagas e a arquitetura do banco de dados devem ser capazes de suportar pelo menos 1.000 usuários navegando e lendo vagas simultaneamente sem gargalos.
*   **RNF07 - Suportabilidade (Supportability) :** A geração de arquivos em lote, como os PDFs dos certificados digitais, deve ocorrer de forma assíncrona no servidor (via filas/background jobs) para não travar a interface do usuário.
*   **RNF08 - Segurança (Security) :** Uma vez atestada a carga horária e gerado o certificado digital correspondente, esses registros não poderão sofrer qualquer tipo de alteração ou exclusão no banco de dados.
*   **RNF09 - Confiabilidade (Reliability) :** A emissão de certificados deve utilizar a geração de UUIDs (Identificadores Únicos Universais) para criar códigos e URLs públicas de validação, garantindo uma quantidade mínima de colisões e segurança na checagem.