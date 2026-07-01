
# Relatório de Consolidação de Decisões de Projeto e Estratégia de Validação

## 1. Estratégia de Validação

Diferente de um modelo de desenvolvimento onde o cliente valida cada microinteração (US), adotamos uma estratégia baseada em **Pontos de Inflexão Estratégica**.

* **Justificativa:** O projeto Liaison atende a dois perfis distintos (Estudantes e ONGs). Submeter o cliente a validações de fluxos técnicos de uso exclusivo dos estudantes seria ineficiente e dispersaria o foco de valor do projeto.
* **Abordagem:** O cliente foi posicionado como validador nas etapas de concepção, prototipagem de fluxos críticos de negócio (como o fluxo de cadastro e humanização das vagas) e na entrega consolidada do produto final.


## 2. Registro de Validação por Incidente e Requisito

### Legenda de Classificação

* **VP:** Validação de Problema (Elicitação)
* **PR:** Protótipo
* **RQ:** Requisito (Alinhamento de Regra de Negócio)
* **SF:** Software Funcional / Processo de Desenvolvimento

## 2. Registro de Validação por Incidente e Requisito

| Data | US/RF | Tipo | Artefato | Feedback / Decisão | Status | Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 12/04 | N/A | VP | Reunião | Elicitação inicial e validação da proposta de valor | ✅ Aprovado | [Ata 01](/docs/execucao/atas/ata_01_elicitaçao_valdemir_12_04.md) |
| 02/05 | RF03 | RQ | Arquitetura | Cadastro de Org: via Painel Admin (segurança) | ✅ Aprovado | [Ata 02](/docs/execucao/atas/ata_02_organizacao_reqs_02_05.md) |
| 02/05 | RF03 | PR | Protótipo | Gestão de fotos/galeria mantida para humanização | ✅ Aprovado | [Ata 02](/docs/execucao/atas/ata_02_organizacao_reqs_02_05.md) |
| 02/05 | RF01 | RQ | Autenticação | Fluxo de Login via tokens (JWT) estabelecido | ✅ Aprovado | [Ata 02](/docs/execucao/atas/ata_02_organizacao_reqs_02_05.md) |
| 19/05 | RF01 | RQ | Performance | Métrica: 1000 usuários simultâneos e busca < 3s | ✅ Aprovado | [Ata 04](/docs/execucao/atas/ata_04_priorizacao_19_05.md) |
| 19/05 | RF03 | RQ | Cadastro Org | Fluxo de cadastro simplificado para reduzir esforço | ✅ Aprovado | [Ata 04](/docs/execucao/atas/ata_04_priorizacao_19_05.md) |
| 19/05 | N/A | RQ | DoR/DoD | Ajuste de critérios de aceite atrelados à US | ✅ Aprovado | [Ata 04](/docs/execucao/atas/ata_04_priorizacao_19_05.md) |
| 19/05 | RF | RQ | Rastreabilidade | Criação de vínculo: Definition of Done (DoD) vs. RF | ✅ Aprovado | [Ata 05](/docs/execucao/atas/ata_05_monitoria_19_05.md) |
| 02/06 | SF | SF | Papéis | Realocação ágil: criação de papel de Infraestrutura | ✅ Aprovado | [Ata 07](/docs/execucao/atas/ata_07_monitoria_02_06.md) |
| 09/06 | SF | SF | Painel Admin | Retrabalho de código devido falha de hardware (Luis) | ⚠️ Aprovado c/ ressalvas | [Ata 08](/docs/execucao/atas/ata_08_monitoria_09_06.md) |

---

## Notas sobre o Backlog e Qualidade

O backlog do projeto Liaison passou por um refinamento contínuo ao longo do desenvolvimento do projeto. É importante notar que:

* **Inexistência de Rollback:** Não houve feedbacks negativos de User Stories que exigissem *rollback* ou cancelamento de requisitos. As funcionalidades foram construídas com base na validação estratégica realizada nas atas de concepção e prototipagem.
* **Ajustes de Processo:** As alterações ocorridas foram majoritariamente de **priorização** (utilizando a matriz ICE Score) e de **readequação de papéis** da equipe (como a criação da função de infraestrutura/deploy) para garantir que o desenvolvimento fosse estável e previsível.
* **Rastreabilidade:** Esta tabela consolida as principais decisões tomadas em reuniões de alinhamento e com o monitor, servindo como o documento oficial de rastreio de decisões entre os requisitos elicitados e as entregas de software. 