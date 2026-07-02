# Consolidação de Requisitos, Feedbacks e Estratégia de Validação

## 1. Estratégia de Validação
Adotamos uma estratégia baseada em **Pontos de Inflexão Estratégica**. A validação concentrou-se na concepção, prototipagem de fluxos críticos de negócio e na entrega consolidada, garantindo que o tempo do cliente fosse utilizado para decisões estratégicas, enquanto a equipe mantinha autonomia técnica para o desenvolvimento operacional.

## 2. Registro de Validação por Incidente e Requisito

### Legenda de Classificação
* **VP:** Validação de Problema (Elicitação)
* **PR:** Protótipo
* **RQ:** Requisito (Alinhamento de Regra de Negócio)
* **SF:** Software Funcional / Processo de Desenvolvimento

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
O backlog do projeto Liaison passou por um refinamento contínuo ao longo do desenvolvimento do projeto. 
* **Inexistência de Rollback:** Não houve feedbacks negativos que exigissem *rollback*.
* **Ajustes de Processo:** Alterações de priorização (ICE Score) e readequação de papéis para garantir estabilidade.
* **Rastreabilidade:** Documento oficial de rastreio de decisões entre requisitos e entregas.
