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
| **RF04 Gerenciar perfil de Estudante** | **US1.4** Como estudante, desejo gerenciar e editar meu perfil para manter minhas informações atualizadas e relevantes para oportunidades de voluntariado. | CP01 | RNF04 |
| **RF05 Gerenciar perfil de Organização** | **US1.5** Como organização, desejo editar meu perfil institucional para manter as informações da organização atualizadas e atrativas para estudantes voluntários. | CP01 | RNF04 |
| **RF06 Recuperar senha** | **US1.6** Como usuário, desejo recuperar minha senha via e-mail para poder acessar minha conta caso esqueça a senha. | CP01 | RNF01 |
| **RF07 Moderar organização** | **US1.7** Como administrador (Sysmin), desejo ter um painel para moderar cadastros de organizações sociais para garantir a legitimidade das organizações na plataforma. | CP01 | RNF04 |
| **RF21 Criar oportunidade** | **US2.1** Como organização, desejo criar novas vagas de voluntariado para atrair estudantes interessados em participar das atividades da organização. | CP02 | RNF04, RNF06 |
| **RF22 Editar oportunidade** | **US2.2** Como organização, desejo editar informações de vagas de voluntariado existentes para mantê-las atualizadas. | CP02 | RNF04 |
| **RF23 Publicar oportunidade** | **US2.3** Como organização, desejo publicar vagas de voluntariado para que fiquem visíveis aos estudantes. | CP02 | RNF04 |
| **RF24 Encerrar oportunidade** | **US2.4** Como organização, desejo encerrar vagas de voluntariado quando não houver mais necessidade. | CP02 | RNF04 |
| **RF08 Buscar vaga** | **US2.5** Como estudante, desejo buscar e filtrar vagas de voluntariado para encontrar oportunidades que correspondam ao meu interesse e disponibilidade. | CP02 | RNF04, RNF05, RNF06 |
| **RF09 Consultar vaga** | **US2.6** Como estudante, desejo visualizar os detalhes completos de uma vaga de voluntariado para decidir se devo me candidatar. | CP02 | RNF04 |
| **RF10 Realizar candidatura** | **US2.7** Como estudante, desejo me candidatar a uma vaga de voluntariado ativa para participar das atividades da organização. | CP02 | RNF04, RNF06 |
| **RF11 Avaliar candidatura** | **US2.8** Como organização, desejo avaliar as candidaturas dos estudantes para aprovar ou recusar participantes nas vagas de voluntariado. | CP02 | RNF04, RNF06 |
| **RF12 Cancelar candidatura** | **US2.9** Como estudante, desejo cancelar minha candidatura a uma vaga de voluntariado caso não tenha mais interesse ou disponibilidade. | CP02 | RNF04 |
| **RF13 Notificar candidatura** | **US2.10** Como usuário, desejo receber notificações sobre mudanças de status de candidaturas. | CP02 | RNF04 |
| **RF14 Listar aprovados** | **US3.1** Como organização, desejo visualizar a lista de estudantes aprovados para cada atividade de voluntariado para gerenciar o acompanhamento e a presença. | CP03 | RNF04, RNF08 |
| **RF15 Registrar frequência** | **US3.2** Como organização, desejo registrar a presença e atestar a carga horária dos estudantes aprovados para documentar a participação nas atividades. | CP03 | RNF04, RNF08 |
| **RF16 Emitir certificado** | **US3.3** Como estudante, desejo receber automaticamente meu certificado digital em PDF ao concluir uma atividade de voluntariado. | CP03 | RNF07, RNF08, RNF09 |
| **RF17 Compartilhar certificado** | **US3.4** Como estudante, desejo exportar meus certificados digitais em formato PDF para comprovação acadêmica. | CP03 | RNF07, RNF08, RNF09 |
| **RF18 Consultar histórico** | **US3.5** Como estudante, desejo visualizar meu histórico de horas de voluntariado para acompanhar minha evolução. | CP03 | RNF04, RNF07, RNF08 |
| **RF19 Compartilhar histórico**  | **US3.6** Como estudante, desejo fazer download dos meus certificados de voluntariado para comprovação acadêmica. | CP03 | RNF04, RNF07, RNF08 |
| **RF20 Validar certificado** | **US3.7** Como qualquer pessoa, desejo acessar um portal público para validar a autenticidade de um certificado por meio de URL ou QR Code. | CP03 | RNF07, RNF09 |

## 10.2 Priorização do Backlog

A priorização combina três técnicas em funil: **MoSCoW** (filtro de negócio) → **ICE Score** (nota numérica) → **Matriz Facilidade × Valor** (quadrante). Nenhuma decide sozinha — elas fornecem os dados, e a sequência final é definida pelo time no KanbanXP, considerando também dependências e capacidade da semana.

**Trava do MoSCoW:** um item de banda inferior nunca entra antes de esgotar a banda superior; o ICE só desempata *dentro* da mesma banda.

| Técnica | Papel | O que decide |
| :--- | :--- | :--- |
| **MoSCoW** | Filtro de negócio | Banda: Must / Should / Could / Won't |
| **ICE Score** | Quantificador e desempate | Ordem dentro da banda |
| **Matriz Facilidade × Valor** | Alerta visual | Quadrante: Quick Win / Plan / Later / Drop |

### 10.2.1 MoSCoW — filtro de negócio

- **Must have:** inegociável; sem isso não há lançamento.
- **Should have:** importante, mas o produto sobrevive sem ele por um tempo.
- **Could have:** nice to have; agrega qualidade, pode ser postergado.
- **Won't have:** descartado conscientemente para este ciclo.

### 10.2.2 ICE Score — quantificação e desempate

```
ICE Score = Impacto (I) × Confiança (C) × Facilidade (E)     (range: 1 a 1.000)
```

Cada eixo vai de 1 a 10. Em **Facilidade**, 10 = trivial e 1 = muito difícil.

| Dimensão | Zona Crítica | Zona Média | Zona Ideal |
| :--- | :--- | :--- | :--- |
| **I — Impacto** | 1–6: afeta <50% dos usuários; sem impacto no ciclo extensão→certificado; sem risco de abandono da plataforma | 7–8: afeta >50% dos usuários OU é parte do ciclo extensão→certificado OU remove fricção que causa abandono do SaaS | 9–10: existencial — sem isso o SaaS não entrega o ciclo completo; OU diferencia o Liaison de planilhas/grupos de WhatsApp; OU previne risco crítico de credibilidade |
| **C — Confiança** | 1–3: time nunca implementou nada similar; alto risco de retrabalho total; depende de infra não dominada | 4–6: tecnologia nova para o time; ~50% de chance de retrabalho parcial (ex.: Django Admin customizado, PDF estilizado, search multi-filtro, Celery/SMTP) | 7–10: tecnologia dominada; CRUD Django/DRF padrão; algoritmos públicos; configuração nativa do framework |
| **E — Facilidade** | 1–4: >18h — múltiplos sistemas, exige fatiamento (capacidade: 36h/semana — 6 devs × 1h/dia × 6 dias) | 5–7: 6–18h — 1 a 2 sistemas, cabe no fluxo do time | 8–10: <6h — trivial, 1 dev, 1 sistema, risco zero |

### 10.2.3 Matriz Facilidade × Valor — visualização

|  | **Alta Facilidade (E ≥ 5)** | **Baixa Facilidade (E ≤ 4)** |
| :--- | :--- | :--- |
| **Alto Impacto (I ≥ 7)** | **Quick Win** — prioridade máxima de execução | **Plan** — alto valor mas complexo; fatiar até E ≥ 5 |
| **Baixo Impacto (I ≤ 6)** | **Later** — fill-in; entra só se sobrar capacidade | **Drop** — descarte, salvo anomalia |

> **Limitação:** a matriz não considera dependências entre itens; o sequenciamento no KanbanXP ajusta a ordem quando há pré-requisitos.

---

> A listagem priorizada completa — bandas MoSCoW com ICE Score, quadrante da Matriz e cadeias de dependência — está na página dedicada **[Backlog Priorizado](backlog_priorizado.md)**.

---

## 10.3 MVP (Minimum Viable Product)

O MVP é composto pelas 21 histórias classificadas como **Must Have** (ordens 1–21 do [Backlog Priorizado](backlog_priorizado.md)). Este conjunto cobre os fluxos essenciais dos três perfis de usuário:

| Perfil | Fluxos cobertos pelo MVP |
| :--- | :--- |
| **Estudante** | Cadastro, login, busca de vagas, visualização de detalhes, candidatura, acompanhamento de status, recebimento de certificado |
| **Organização** | Cadastro (com moderação), login, criação/edição/publicação de vagas, avaliação de candidaturas, registro de frequência |
| **Administrador** | Moderação de cadastros de organizações |

Total de itens no MVP: **21** histórias de usuário Must Have.

### Nota sobre o RF17 — Validar certificado

O RF17 (Validar certificado) foi intencionalmente excluído do MVP por duas razões complementares:

**1. Dependência técnica sequencial:** A validação pública de certificados pressupõe que certificados já existam na base de dados. O RF17 só agrega valor real após o RF15 (Emitir certificado) estar consolidado em produção e com volume suficiente de certificados emitidos. Incluí-lo no MVP seria antecipar uma funcionalidade sem base de dados para sustentá-la.

**2. Priorização pelo ICE Score:** O RF17 obteve ICE Score de 120 — o menor entre os requisitos do CP03 — reflexo da Confiança baixa (C=5) atribuída pela equipe diante da incerteza sobre o volume de uso da validação pública na fase inicial. A Facilidade estimada (E=4) é baixa para um primeiro ciclo.

**Reclassificação proposta:** O RF17 permanece como **Should Have** e será incorporado na **Release R4** (14/07/2026), imediatamente após a estabilização do RF15. A presença do RNF09 (UUIDs para certificados) já no MVP garante que a infraestrutura de validação estará pronta quando o RF17 for implementado — os certificados emitidos no MVP já conterão os códigos únicos necessários para a validação futura.

## 10.4 Anexos de Priorização

Abaixo estão os documentos de apoio utilizados pela equipe durante as sessões de priorização:

### Matriz de Priorização
![Matriz de Priorização](assets/Matriz.pdf){ type="application/pdf" width="100%" height="800" }

### Priorização MoSCoW
![Priorização MoSCoW](assets/MoSCoW.pdf){ type="application/pdf" width="100%" height="800" }
