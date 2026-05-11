# 8 REQUISITOS DE SOFTWARE

Esta seção descreve os requisitos necessários para o desenvolvimento do software. Ela está dividida em requisitos funcionais e não funcionais, que apresentam as funcionalidades do sistema e as qualidades que ele deve possuir para atender às expectativas dos usuários.

## 8.1 Lista de Requisitos Funcionais

Os requisitos funcionais descrevem as funcionalidades específicas que o sistema deve implementar para atender às necessidades do negócio. Eles incluem integrações, processos e interações do usuário com o sistema.

*   **RF01:** Cadastrar estudantes universitários.
*   **RF02:** Cadastrar organizações sociais.
*   **RF03:** Autenticar usuários.
*   **RF04:** Gerenciar perfil de estudantes.
*   **RF05:** Editar perfil de organizações.
*   **RF06:** Recuperar senha de acesso.
*   **RF07:** Moderar cadastro de organizações.
*   **RF08:** Gerenciar vagas de voluntariado.
*   **RF09:** Buscar vagas de voluntariado.
*   **RF10:** Visualizar detalhes de vagas.
*   **RF11:** Candidatar-se a vagas.
*   **RF12:** Cancelar candidatura a vagas.
*   **RF13:** Avaliar candidaturas de estudantes.
*   **RF14:** Notificar status de candidaturas.
*   **RF15:** Listar estudantes aprovados.
*   **RF16:** Registrar presença e atestar horas.
*   **RF17:** Gerar certificados digitais.
*   **RF18:** Exportar certificados em PDF.
*   **RF19:** Visualizar histórico de voluntariado.
*   **RF20:** Validar autenticidade de certificados.
*   **RF21:** Baixar certificados digitais.

---

## 8.2 Lista de Requisitos Não Funcionais

Os requisitos não funcionais especificam as qualidades e restrições do sistema, como desempenho, segurança e usabilidade, que não estão diretamente relacionadas às funcionalidades oferecidas, mas são essenciais para garantir a qualidade do software. Utilize o modelo URPS+ para classificar os requisitos não funcionais.

*   **RNF01 - Segurança (Security) :** As senhas dos usuários devem ser armazenadas utilizando algoritmos de criptografia irreversíveis (ex: bcrypt), garantindo total proteção contra vazamentos.
*   **RNF02 - Desempenho (Performance) :** O processo de login deve fornecer uma resposta ao usuário em no máximo 2 segundos, considerando condições normais de rede.
*   **RNF03 - Confiabilidade (Reliability) :** O sistema deve assegurar a formatação e a validade matemática dos CNPJs inseridos durante o cadastro das organizações sociais.
*   **RNF04 - Usabilidade (Usability) :** A interface do sistema deve ser responsiva e totalmente operável em dispositivos móveis iOS e Android, sem quebras de layout.
*   **RNF05 - Desempenho (Performance) :** Os resultados retornados pelo motor de buscas, mesmo após a aplicação de múltiplos filtros, devem ser carregados em menos de 3 segundos.
*   **RNF06 - Desempenho (Performance) :** O módulo de vagas e a arquitetura do banco de dados devem ser capazes de suportar pelo menos 1.000 usuários navegando e lendo vagas simultaneamente sem gargalos.
*   **RNF07 - Suportabilidade (Supportability) :** A geração de arquivos em lote, como os PDFs dos certificados digitais, deve ocorrer de forma assíncrona no servidor (via filas/background jobs) para não travar a interface do usuário.
*   **RNF08 - Segurança (Security) :** Uma vez atestada a carga horária e gerado o certificado digital correspondente, esses registros não poderão sofrer qualquer tipo de alteração ou exclusão no banco de dados.
*   **RNF09 - Confiabilidade (Reliability) :** A emissão de certificados deve utilizar a geração de UUIDs (Identificadores Únicos Universais) para criar códigos e URLs públicas de validação, garantindo ausência matemática de colisões e segurança na checagem.