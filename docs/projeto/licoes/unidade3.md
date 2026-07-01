# 11 LIÇÕES APRENDIDAS - Unidade 3

A Unidade 3 marcou a consolidação do projeto na fase de construção, engenharia técnica e validação contínua. A equipe focou fortemente na implementação do produto (frontend, backend e infraestrutura), aplicando na prática o framework KanbanXP, validando protótipos de alta fidelidade com o cliente e garantindo a rastreabilidade ponta a ponta dos artefatos.

**Dificuldades enfrentadas e como foram superadas:**

A principal dificuldade enfrentada pela equipe nesta etapa foi a transição técnica para o ambiente de produção, especialmente devido à curva de aprendizado e ao tempo imprevisto demandado para configurar a infraestrutura na nuvem da AWS (envolvendo EC2, RDS, Docker, Nginx e Gunicorn). Esse gargalo atrasou os primeiros deploys e foi superado por meio de um *Spike* arquitetural focado em DevOps, que culminou na criação de scripts de automação. Além disso, a integração entre o aplicativo móvel e a API — sobretudo no gerenciamento e persistência de tokens JWT — exigiu um esforço extra que foi mitigado com a padronização de serviços e a adoção estrita de TDD.

**Pontos fortes identificados:**

A equipe demonstrou excelente maturidade na aplicação prática do Extreme Programming (XP) acoplado ao Kanban. O uso do GitHub Projects garantiu transparência no gerenciamento de fluxo e limitação do WIP. A comunicação se manteve ágil com Dailies síncronas (Teams) e assíncronas (WhatsApp), além da forte adoção de *Pair Programming* durante o desenvolvimento de código. Outro grande destaque foi o foco em "User Design" e validação contínua: a equipe construiu protótipos de alta fidelidade no Figma e submeteu os fluxos à avaliação formal do cliente por meio de formulários (escala Likert), garantindo a aprovação do design antes de focar esforços na codificação. Além disso, a base do sistema (autenticação JWT, gestão de perfis e testes) foi implementada com sucesso.

**Ações de melhoria para a Unidade 4:**

- Integração e Deploy Contínuo (CI/CD): Consolidar o processo de deploy automatizado utilizando os scripts (`deploy.sh`) e arquivos Docker recém-criados, garantindo entregas rápidas, seguras e sem fricção na AWS.
- Expansão e Manutenção da Qualidade: Manter a cultura de Test-Driven Development (TDD) rigorosa para abranger as novas implementações da Release 3 e 4, garantindo o cumprimento absoluto do DoD e das métricas estabelecidas nos novos RNFs.
- Fechamento do Ciclo de Valor: Concentrar os esforços na conclusão do ciclo operacional completo das vagas (criação, edição e triagem) e iniciar a base do processo de certificação imutável, garantindo que as premissas de negócio e segurança validadas com o cliente se concretizem no software final.