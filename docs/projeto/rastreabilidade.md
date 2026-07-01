# Rastreabilidade de Requisitos

A rastreabilidade garante que cada funcionalidade desenvolvida no software possua uma justificativa clara de negócio, conectando problemas reais às soluções entregues pela equipe.

Abaixo apresentamos a matriz de rastreabilidade (Forward Traceability) que mapeia o fluxo: **Problema > Objetivos > Características de Produto > RFs > User Stories (US)**.

## Matriz de Rastreabilidade

| Problema Identificado (Cenário) | Objetivo do Sistema | Característica do Produto (CP) | Requisitos Funcionais (RFs) | User Stories (US - Issues) |
| :--- | :--- | :--- | :--- | :--- |
| **P1.** Estudantes e ONGs dependem de processos manuais e informais (WhatsApp, planilhas) para encontrar oportunidades e recrutar voluntários, gerando perda de histórico e fraudes. | Centralizar a criação de perfis e autenticação segura para estudantes e organizações. | **CP01** - Gestão de Usuários e Entidades | **RF01** Cadastrar estudante<br>**RF02** Cadastrar org.<br>**RF03** Autenticar usuário<br>**RF04** Gerenciar perfil<br>**RF06** Moderar org. | #12 (US1.1)<br>#13 (US1.2)<br>#14 (US1.3)<br>#15 (US1.4), #16 (US1.5)<br>#18 (US1.7) |
| **P2.** Estudantes perdem muito tempo buscando vagas compatíveis e organizações sofrem para gerenciar múltiplos candidatos em diferentes canais. | Criar um fluxo automatizado de descoberta de vagas, candidatura e aprovação, conectando ambas as partes. | **CP02** - Ciclo de Vagas e Engajamento | **RF18** Criar oportunidade<br>**RF19** Editar oportunidade<br>**RF20** Publicar oportunidade<br>**RF08** Buscar vaga<br>**RF10** Realizar candidatura<br>**RF11** Avaliar candidatura<br>**RF12** Acompanhar status | #19 (US2.1)<br>#50 (US2.2)<br>#51 (US2.3)<br>#20 (US2.5)<br>#22 (US2.7)<br>#24 (US2.8)<br>#23, #25, #86 (US2.9+) |
| **P3.** A coordenação de extensão das universidades não consegue auditar ou validar facilmente as horas de voluntariado devido à ausência de comprovantes padronizados. | Prover o ateste de presença digital e emissão de certificados imutáveis e padronizados que sirvam como comprovação acadêmica. | **CP03** - Acompanhamento e Certificação Acadêmica | **RF13** Listar aprovados<br>**RF14** Registrar frequência<br>**RF15** Emitir certificado<br>**RF16** Consultar histórico<br>**RF17** Validar certificado | #26 (US3.1)<br>#27 (US3.2)<br>#31 (US3.3), #32 (US3.4)<br>#34 (US3.6)<br>#33 (US3.5) |

## Como interpretar a Rastreabilidade

1. **Problema e Objetivos:** Derivados das sessões de elicitação com o cliente e documentados na seção [Cenário Atual](cenario.md) e [Solução Proposta](solucao.md).
2. **Características do Produto (CPs):** Agrupamentos épicos de funcionalidades que encapsulam fluxos completos de valor, documentados nos [Requisitos de Software](requisitos_software.md).
3. **Requisitos Funcionais (RFs):** As ações técnicas sistêmicas que suportam a característica do produto.
4. **User Stories (US):** A unidade atômica de implementação, escrita do ponto de vista do usuário final e rastreada via ID de *Issue* no quadro Kanban do GitHub, documentadas no [Backlog do Produto](backlog_produto.md).
