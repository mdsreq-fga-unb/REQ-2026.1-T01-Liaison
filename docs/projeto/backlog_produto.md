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
| **RF01 Cadastrar estudante** | **US1.1** Como estudante universitário, desejo me cadastrar na plataforma para poder buscar e me candidatar a vagas de voluntariado. | CP01 | **US1.1:** RNF01, RNF04 |
| **RF02 Cadastrar organização** | **US1.2** Como representante de uma organização social, desejo cadastrar minha organização na plataforma para poder publicar vagas de voluntariado. | CP01 | **US1.2:** RNF01, RNF03, RNF04 |
| **RF03 Autenticar usuário** | **US1.3** Como usuário (estudante, organização ou administrador), desejo fazer login na plataforma de forma segura para acessar funcionalidades específicas do meu perfil. | CP01 | **US1.3:** RNF01, RNF02, RNF04 |
| **RF04 Gerenciar perfil** | **US1.4** Como estudante, desejo gerenciar e editar meu perfil para manter minhas informações atualizadas e relevantes para oportunidades de voluntariado.<br><br>**US1.5** Como organização, desejo editar meu perfil institucional para manter as informações da organização atualizadas e atrativas para estudantes voluntários. | CP01 | **US1.4:** RNF04<br><br>**US1.5:** RNF04 |
| **RF05 Recuperar senha** | **US1.6** Como usuário, desejo recuperar minha senha via e-mail para poder acessar minha conta caso esqueça a senha. | CP01 | **US1.6:** RNF01, RNF04 |
| **RF06 Moderar organização** | **US1.7** Como administrador (Sysmin), desejo ter um painel para moderar cadastros de organizações sociais para garantir a legitimidade das organizações na plataforma. | CP01 | **US1.7:** RNF04 |
| **RF18 Criar oportunidade** | **US2.1** Como organização, desejo criar novas vagas de voluntariado para atrair estudantes interessados em participar das atividades da organização. | CP02 | **US2.1:** RNF04 |
| **RF19 Editar oportunidade** | **US2.2** Como organização, desejo editar informações de vagas de voluntariado existentes para mantê-las atualizadas. | CP02 | **US2.2:** RNF04 |
| **RF20 Publicar oportunidade** | **US2.3** Como organização, desejo publicar vagas de voluntariado para que fiquem visíveis aos estudantes. | CP02 | **US2.3:** RNF04 |
| **RF21 Encerrar oportunidade** | **US2.4** Como organização, desejo encerrar vagas de voluntariado quando não houver mais necessidade. | CP02 | **US2.4:** RNF04 |
| **RF08 Buscar vaga** | **US2.5** Como estudante, desejo buscar e filtrar vagas de voluntariado para encontrar oportunidades que correspondam ao meu interesse e disponibilidade. | CP02 | **US2.5:** RNF04, RNF05, RNF06 |
| **RF09 Consultar vaga** | **US2.6** Como estudante, desejo visualizar os detalhes completos de uma vaga de voluntariado para decidir se devo me candidatar. | CP02 | **US2.6:** RNF04, RNF06 |
| **RF10 Realizar candidatura** | **US2.7** Como estudante, desejo me candidatar a uma vaga de voluntariado ativa para participar das atividades da organização. | CP02 | **US2.7:** RNF04 |
| **RF11 Avaliar candidatura** | **US2.8** Como organização, desejo avaliar as candidaturas dos estudantes para aprovar ou recusar participantes nas vagas de voluntariado. | CP02 | **US2.8:** RNF04 |
| **RF12 Acompanhar candidatura** | **US2.9** Como estudante, desejo cancelar minha candidatura a uma vaga de voluntariado caso não tenha mais interesse ou disponibilidade.<br><br>**US2.10** Como usuário, desejo receber notificações sobre mudanças de status de candidaturas para me manter informado em tempo hábil. | CP02 | **US2.9:** RNF04<br><br>**US2.10:** RNF04 |
| **RF13 Listar aprovados** | **US3.1** Como organização, desejo visualizar a lista de estudantes aprovados para cada atividade de voluntariado para gerenciar o acompanhamento e a presença. | CP03 | **US3.1:** RNF04 |
| **RF14 Registrar frequência** | **US3.2** Como organização, desejo registrar a presença e atestar a carga horária dos estudantes aprovados para documentar a participação nas atividades. | CP03 | **US3.2:** RNF04, RNF08 |
| **RF15 Emitir certificado** | **US3.3** Como estudante, desejo receber automaticamente meu certificado digital em PDF ao concluir uma atividade de voluntariado.<br><br>**US3.4** Como estudante, desejo exportar meus certificados digitais em formato PDF para comprovação acadêmica. | CP03 | **US3.3:** RNF07, RNF08, RNF09<br><br>**US3.4:** RNF04, RNF07, RNF09 |
| **RF16 Consultar histórico** | **US3.5** Como estudante, desejo visualizar meu histórico de horas de voluntariado para acompanhar minha evolução.<br><br>**US3.6** Como estudante, desejo fazer download dos meus certificados de voluntariado para comprovação acadêmica. | CP03 | **US3.5:** RNF04<br><br>**US3.6:** RNF04, RNF07 |
| **RF17 Validar certificado** | **US3.7** Como qualquer pessoa, desejo acessar um portal público para validar a autenticidade de um certificado por meio de URL ou QR Code. | CP03 | **US3.7:** RNF04, RNF09 |

## 10.2 Priorização do Backlog

A priorização do backlog utiliza um **funil de três técnicas** (MoSCoW, ICE Score e Matriz Esforço × Valor) para filtrar, quantificar e visualizar os itens.

### Método Principal: Decisão do Time

**Nenhuma das três técnicas define, sozinha, qual item será implementado em seguida.** O método principal de priorização é a **decisão conjunta do time de negócio e desenvolvimento** no momento de puxar um card do Kanban. As técnicas fornecem dados, mas a decisão final é humana e considera:

- Banda de negócio (MoSCoW)
- ICE Score (ordem de análise dentro da banda)
- Quadrante da Matriz (alerta de complexidade)
- Dependências técnicas e cadeia de pré-requisitos
- Capacidade da semana e contexto do fluxo

### 10.2.1 Metodologia de Priorização: MoSCoW → ICE Score → Matriz Esforço × Valor

```
ENTRADA (requisito novo ou em revisão)
    │
    ▼
┌──────────────────────────────────┐
│  CAMADA 1: MoSCoW                │  ← "Isso é vital ou é luxo?"
│  MUST / SHOULD / COULD / WON'T  │
│  WON'T → fecha/descarta         │
└──────────────┬───────────────────┘
               │ (MUST, SHOULD, COULD)
               ▼
┌──────────────────────────────────┐
│  CAMADA 2: ICE Score             │  ← "Qual a nota numérica?"
│  Impacto × Confiança × Facilidade│
│  Ranking dentro de cada banda    │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  CAMADA 3: Matriz Esforço × Valor│  ← "Em qual quadrante caiu?"
│  QUICK WIN / PLAN / LATER / DROP │
└──────────────┬───────────────────┘
               │
               ▼
         FLUXO KANBAN
```

**Trava fundamental do MoSCoW:** Um item COULD **nunca** entra no fluxo antes de um MUST, mesmo que o ICE Score do COULD seja numericamente maior. O MoSCoW é a trava de negócio; o ICE desempata dentro da mesma banda.

### Papel de cada técnica

| Técnica | Papel na priorização | O que decide |
| :--- | :--- | :--- |
| **MoSCoW** | **Filtro de negócio** — separa o vital do descartável | Em qual banda (Must, Should, Could, Won't) o item entra |
| **ICE Score** | **Quantificador e desempate** — dá nota numérica dentro da banda | A ordem de análise dentro da mesma banda MoSCoW |
| **Matriz Esforço × Valor** | **Alerta visual** — sinaliza se o item é Quick Win, Plan, Later ou Drop | Se o item deve ser fatiado, postergado ou descartado (dentro da banda) |

### Regras de conflito

- **Conflito 1:** COULD com ICE maior que MUST → **MoSCoW prevalece**. A banda de negócio é soberana.
- **Conflito 2:** MUST/Should com Q=🗑️ Drop → **MoSCoW prevalece**, mas a Matriz sinaliza risco de complexidade. O time deve avaliar se fatia o item ou aceita o risco.
- **Conflito 3:** MUST com Q=📐 Plan → **MoSCoW prevalece**, mas a execução deve ser fatiada até E ≥ 5.
- **Conflito 4:** SHOULD com Q=⚡ Quick Win → **ICE Score prevalece** para decidir se entra no fluxo antes de outros Should.

---

#### Camada 1 - O Filtro de Negócio - MoSCoW

- **Must have (Deve ter):** Inegociável. Sem isso, não há lançamento do produto.
- **Should have (Deveria ter):** Importante, mas o produto sobrevive sem ele por um tempo.
- **Could have (Poderia ter):** "Nice to have" — agrega qualidade, pode ser postergado.
- **Won't have (Não terá agora):** Descartado conscientemente para este ciclo.

---

#### Camada 2 - A Quantificação e Desempate - ICE Score

Cada requisito recebe uma nota nos três eixos:

- **Impact (Impacto — I):** Quanto valor esse item gera para o negócio ou usuário? (1 a 10)
- **Confidence (Confiança — C):** Qual a certeza da equipe sobre essas estimativas? (1 a 10)
- **Ease (Facilidade — E):** Qual a facilidade de implementação? 10 = muito fácil; 1 = muito difícil. (1 a 10)

```
ICE Score = Impacto × Confiança × Facilidade     (range: 1 a 1.000)
```

| Dimensão | Zona Crítica (1–3 / 1–4 / 1–6) | Zona Média | Zona Ideal |
| :--- | :--- | :--- | :--- |
| **I — Impacto** | 1–6: afeta <50% dos usuários; sem impacto no ciclo extensão→certificado; sem risco de abandono da plataforma | 7–8: afeta >50% dos usuários OU é parte do ciclo extensão→certificado OU remove fricção que causa abandono do SaaS | 9–10: existencial — sem isso o SaaS não entrega o ciclo completo; OU diferencia o Liaison de planilhas/grupos de WhatsApp; OU previne risco crítico de credibilidade |
| **C — Confiança** | 1–3: time nunca implementou nada similar; alto risco de retrabalho total; depende de infra ou integração não dominada pelo time | 4–6: tecnologia nova para o time estudante; documentação disponível, mas vai aprender errando; ~50% de chance de retrabalho parcial (ex.: Django Admin customizado, PDF estilizado, search multi-filtro, Celery/SMTP) | 7–10: tecnologia dominada em aula ou trivialmente verificável; CRUD Django/DRF padrão; algoritmos públicos; configuração nativa do framework |
| **E — Facilidade** | 1–4: >18h — múltiplos sistemas, refatoração pesada, exige fatiamento (capacidade do time: 36h/semana — 6 devs × 1h/dia × 6 dias) | 5–7: 6–18h — 1 a 2 sistemas, cabe no fluxo do time | 8–10: <6h — trivial, 1 dev em até 1 semana, 1 sistema, risco zero |

---

#### Camada 3 - A Visualização e Validação - Matriz Esforço × Valor

|  | **Alta Facilidade (E ≥ 5)** | **Baixa Facilidade (E ≤ 4)** |
| :--- | :--- | :--- |
| **Alto Impacto (I ≥ 7)** | ⚡ **Quick Win** — prioridade máxima de execução | 📐 **Plan** — alto valor mas complexo; **fatiar** em sub-issues até E ≥ 5 |
| **Baixo Impacto (I ≤ 6)** | ⏳ **Later** — fill-in; entra só se sobrar capacidade após Must + Should | 🗑️ **Drop** — descarte; fechar como descartada, salvo anomalia |

> **Limitação:** A matriz ordena itens por valor estratégico e relação facilidade/impacto, mas **não considera dependências técnicas ou de negócio** entre os itens. O planejamento do fluxo no KanbanXP ajusta a sequência quando um item depende de outro.

---

### 10.2.2 Backlog Priorizado

Cada item foi classificado por critério de negócio (MoSCoW) e depois quantificado pelo ICE Score (`I × C × E`). A trava MoSCoW é absoluta: um COULD jamais entra no fluxo antes de um MUST, independente do ICE.

> **Ordenação:** 1º) Banda MoSCoW. 2º) ICE decrescente. **A tabela é uma referência; a sequência real de implementação é definida pelo time no KanbanXP, respeitando MoSCoW + resolução das cadeias + contexto do momento.**
>
> **Q** = Quadrante: ⚡ Quick Win, 📐 Plan, ⏳ Later, 🗑️ Drop. O **E** exibido é o valor final (E bruto − penalidade por dependência, cap −2). **Cadeia:** `A → B → C` = A depende de B → B depende de C. Número entre parênteses = prof. (itens únicos na cadeia). ⛔ = bloqueado pela trava MoSCoW.

---

#### 🔴 Must Have - 19 itens (MVP)
> Inegociáveis — sem eles, a plataforma não entrega a proposta de valor mínima.

| # | ID | Descrição | Q | I | C | E | ICE | Cadeia (prof.) |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | RNF01 | Criptografia de senhas (bcrypt) | ⚡ | 10 | 10 | 10 | **1.000** | — (0) |
| 2 | RNF04 | Interface responsiva (iOS e Android) | ⚡ | 9 | 8 | 8 | **576** | — (0) |
| 3 | RNF08 | Imutabilidade de certificados | ⚡ | 9 | 9 | 7 | **567** | RF15 → RF14 → RF13 → RF11 → RF10 → RF01, RF20 → RF18 (8) |
| 4 | RF01 | Cadastrar estudante | ⚡ | 10 | 8 | 7 | **560** | — (0) |
| 5 | RF09 | Consultar vaga | ⚡ | 8 | 9 | 7 | **504** | RF20 → RF18 (2) |
| 6 | RF20 | Publicar oportunidade | ⚡ | 8 | 9 | 7 | **504** | RF18 (1) |
| 7 | RF03 | Autenticar usuário | ⚡ | 8 | 8 | 7 | **448** | RF01, RF02 (2) |
| 8 | RF02 | Cadastrar organização | ⚡ | 10 | 7 | 6 | **420** | — (0) |
| 9 | RF10 | Realizar candidatura | ⚡ | 10 | 7 | 5 | **350** | RF01, RF20 → RF18 (3) |
| 10 | RF18 | Criar oportunidade ⚠️ | ⚡ | 10 | 7 | 5 | **350** | — (0) |
| 11 | RF04 | Gerenciar perfil | ⚡ | 7 | 8 | 6 | **336** | RF01 (1) |
| 12 | RF19 | Editar oportunidade | ⚡ | 7 | 8 | 6 | **336** | RF18 (1) |
| 13 | RF13 | Listar aprovados | ⚡ | 7 | 8 | 6 | **336** | RF11 → RF10 → RF01, RF20 → RF18 (5) |
| 14 | RF12 | Acompanhar candidatura | ⚡ | 8 | 7 | 6 | **336** | RF10 → RF01, RF20 → RF18 (4) |
| 15 | RF11 | Avaliar candidatura | ⚡ | 9 | 7 | 5 | **315** | RF10 → RF01, RF20 → RF18 (4) |
| 16 | RF14 | Registrar frequência ⚠️ | 📐 | 9 | 7 | 4 | **252** | RF13 → RF11 → RF10 → RF01, RF20 → RF18 (6) |
| 17 | RF06 | Moderar organização | ⚡ | 7 | 6 | 5 | **210** | RF02 (1) |
| 18 | RF08 | Buscar vaga ⚠️ | 📐 | 9 | 6 | 3 | **162** | RF20 → RF18 (2) |
| 19 | RF15 | Emitir certificado ⚠️ | 📐 | 10 | 5 | 3 | **150** | RF14 → RF13 → RF11 → RF10 → RF01, RF20 → RF18 (7) |

> ⚠️ **Plan:** RF14 (E=4), RF08 (E=3, fatiar busca em básica + filtros + UX), RF15 (E=3, C=5 — spike técnico obrigatório antes de iniciar).

---

#### 🟡 Should Have - 6 itens
> Importantes para a qualidade; o MVP sobrevive sem eles no lançamento inicial.

| # | ID | Descrição | Q | I | C | E | ICE | Cadeia (prof.) |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 20 | RNF03 | Validação de CNPJ | ⚡ | 5 | 9 | 9 | **405** | — (0) |
| 21 | RF21 | Encerrar oportunidade | ⚡ | 6 | 8 | 7 | **336** | RF20 → RF18 (2) |
| 22 | RNF02 | Login em até 2 segundos | ⏳ | 6 | 6 | 8 | **288** | — (0) |
| 23 | RNF05 | Busca em até 3 segundos | ⏳ | 6 | 6 | 8 | **288** | — (0) |
| 24 | RF16 | Consultar histórico | 📐 | 7 | 7 | 4 | **196** | RF15 → RF14 → RF13 → RF11 → RF10 → RF01, RF20 → RF18 (8) |
| 25 | RNF06 | Suporte a 1.000 usuários simultâneos | 🗑️ | 4 | 4 | 7 | **112** | — (0) |

> ⚠️ **RNF02 e RNF05 (⏳ Later):** SLAs de performance são irrelevantes para MVP com volume controlado. Otimização sem baseline de produção não se justifica neste momento.
>
> ⚠️ **RNF06 (🗑️ Drop):** Escala para 1.000 usuários simultâneos é preocupação de crescimento, não de lançamento. Load testing é território desconhecido para o time.

---

#### 🟢 Could Have - 2 itens
> Desejáveis — agregam qualidade mas podem ser postergados sem comprometer o valor central.

| # | ID | Descrição | Q | I | C | E | ICE | Cadeia (prof.) |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 26 | RNF09 | UUIDs para certificados | ⚡ | 8 | 5 | 6 | **240** | RF15 → ... → RF18 (8) |
| 27 | RF17 | Validar certificado | 📐 | 6 | 5 | 4 | **120** | RF15 → ... → RF18 (8) |

---

#### ⚪ Won't Have - 2 itens
> Descartados conscientemente para este ciclo; o valor gerado não justifica o esforço agora.

| # | ID | Descrição | Q | I | C | E | ICE | Cadeia (prof.) |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 28 | RF05 | Recuperar senha | ⚡ | 5 | 6 | 7 | **210** | — (0) |
| 29 | RNF07 | Geração assíncrona de PDFs | ⏳ | 4 | 4 | 6 | **96** | — (0) |

---

### 10.2.3 Análise de Anomalias

O ICE não tem contexto de negócio — o **MoSCoW é a trava de segurança**. As anomalias abaixo são **alertas para o time avaliar**, não regras automáticas de descarte. A ação final depende da análise conjunta de negócio e desenvolvimento no momento de puxar o card.

Anomalias residuais após a priorização:

| ID(s) | Anomalia | Risco | Ação |
|:---|:---|:---:|:---|
| **RF15** | C=5 — geração de PDF estilizado é território novo para o time. E=3 (📐 Plan). | Alto | Spike técnico com reportlab/weasyprint **antes** de iniciar |
| **RF08** | C=6 — busca multi-filtro é o item mais complexo do backlog. E=3 (📐 Plan). | Alto | Fatiar: (1) busca básica, (2) filtros avançados, (3) UX mobile |
| **RF18** | E=5 no limiar Quick Win/Plan. ~13h incluindo formulário multi-passo. | Médio | Fatiar: (1) modelo+endpoint, (2) formulário, (3) validações+publicação |
| **RF10, RF11** | Must Have no limiar E=5. Dependem de RF01 e RF18 para serem puxados. | Médio | Garantir RF01 e RF18 concluídos antes de puxar RF10/RF11 |
| **RNF06** | Should Have com ICE 112 (🗑️ Drop). Escala irrelevante para MVP. | Baixo | Revisitar quando base ativa > 100 usuários |

---

## 10.3 MVP (Minimum Viable Product)

O MVP é composto pelos 19 itens classificados como **Must Have**, correspondentes às posições #1 a #19 da tabela consolidada. Este conjunto cobre os fluxos essenciais dos três perfis de usuário:

| Perfil | Fluxos cobertos pelo MVP |
| :--- | :--- |
| **Estudante** | Cadastro, login, busca de vagas, visualização de detalhes, candidatura, acompanhamento de status, recebimento de certificado |
| **Organização** | Cadastro (com moderação), login, criação/edição/publicação de vagas, avaliação de candidaturas, registro de frequência |
| **Administrador** | Moderação de cadastros de organizações |

Total de itens no MVP: **19** (17 RFs + 2 RNFs).

### Nota sobre o RF17 — Validar certificado

O RF17 (Validar certificado) foi intencionalmente excluído do MVP por duas razões complementares:

**1. Dependência técnica sequencial:** A validação pública de certificados pressupõe que certificados já existam na base de dados. O RF17 só agrega valor real após o RF15 (Emitir certificado) estar consolidado em produção e com volume suficiente de certificados emitidos. Incluí-lo no MVP seria antecipar uma funcionalidade sem base de dados para sustentá-la.

**2. Priorização pelo ICE Score:** O RF17 obteve ICE Score de 0,75 — o menor entre os requisitos do CP03 — reflexo da Confiança baixa (0,6) atribuída pela equipe diante da incerteza sobre o volume de uso da validação pública na fase inicial. O Esforço estimado (8) é alto para um primeiro ciclo.

**Reclassificação proposta:** O RF17 permanece como **Should Have** e será incorporado na **Release R4** (14/07/2026), imediatamente após a estabilização do RF15. A presença do RNF09 (UUIDs para certificados) já no MVP garante que a infraestrutura de validação estará pronta quando o RF17 for implementado — os certificados emitidos no MVP já conterão os códigos únicos necessários para a validação futura.

## 10.4 Anexos de Priorização

Abaixo estão os documentos de apoio utilizados pela equipe durante as sessões de priorização:

### Matriz de Priorização
![Matriz de Priorização](assets/Matriz.pdf){ type="application/pdf" width="100%" height="800" }

### Priorização MoSCoW
![Priorização MoSCoW](assets/MoSCoW.pdf){ type="application/pdf" width="100%" height="800" }

## 10.5 Nota sobre o RF17 — Validar certificado

O RF17 (Validar certificado) foi intencionalmente excluído do MVP por duas razões complementares:

1. **Dependência técnica sequencial:** A validação pública de certificados pressupõe que certificados já existam na base de dados. O RF17 só agrega valor real após o RF15 (Emitir certificado) estar consolidado em produção e com volume suficiente de certificados emitidos. Incluí-lo no MVP seria antecipar uma funcionalidade sem base de dados para sustentá-la.

2. **Priorização pelo ICE Score:** O RF17 obteve ICE Score de 120 — o menor entre os requisitos do CP03 — reflexo da Confiança baixa (C=5) atribuída pela equipe diante da incerteza sobre o volume de uso da validação pública na fase inicial. O Esforço estimado (E=4) é alto para um primeiro ciclo.

**Reclassificação proposta:** O RF17 permanece como Should Have e será incorporado na Release R4 (14/07/2026), imediatamente após a estabilização do RF15. A presença do RNF09 (UUIDs para certificados) já no MVP garante que a infraestrutura de validação estará pronta quando o RF17 for implementado — os certificados emitidos no MVP já conterão os códigos únicos necessários para a validação futura.
