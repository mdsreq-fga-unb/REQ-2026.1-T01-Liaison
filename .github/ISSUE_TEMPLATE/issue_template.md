---
name: "Feature / Funcionalidade"
description: "Use este template para novas funcionalidades, histórias de usuário ou melhorias."
title: "[TIPO] Descrição concisa da funcionalidade"
labels: ["feature", "priority:medium"]
assignees: []
---

## História de Usuário
Como **<persona>**, quero **<ação>** para **<benefício>**

---

## Rastreabilidade
| Item | Código / Referência |
|------|---------------------|
| **User Story** | US<CP#>.<seq> |
| **Requisito Funcional** | RF## — <nome do RF> |
| **Característica de Produto** | CP0# — <nome da CP> |
| **Requisitos Não-Funcionais** | RNF##, RNF## |
| **Release Planejada** | R# — <nome da release> |

---

## Descrição
<detalhamento do contexto, motivação e escopo da funcionalidade. O que precisa ser construído ou corrigido? Por que isso importa? Qual é o alcance (frontend, backend, full-stack)?>

---

## Critérios de Aceite (BDD / Gherkin)

### Cenário 1: <título do cenário principal — caminho feliz>
**Dado** <pré-condição / estado inicial>
**Quando** <ação executada pelo usuário ou sistema>
**Então** <resultado esperado, observável e verificável>

### Cenário 2: <título do cenário — estado de erro ou validação>
**Dado** <pré-condição / estado inicial>
**Quando** <ação executada>
**Então** <resultado esperado — mensagem de erro, bloqueio, etc.>

### Cenário 3: <título do cenário — edge case ou regra de negócio>
**Dado** <pré-condição / estado inicial>
**Quando** <ação executada>
**Então** <resultado esperado>

> **Regra DoR-G02:** Todo item de backlog deve conter **pelo menos um** cenário de aceitação estruturado no formato Dado / Quando / Então.

---

## Regras de Negócio
- <regra 1 — validação, permissão, restrição de workflow, etc.>
- <regra 2>
- <... ou "N/A" se for puramente técnico>

---

## Requisitos Técnicos
- <restrições arquiteturais do PROJECT_CONTEXT.md>
- <stack, performance, segurança, etc.>
- <endpoints de API esperados, se aplicável>

---

## Referências de Design
- **Protótipo Figma (Desktop):** <link com node-id>
- **Protótipo Figma (Mobile):** <link com node-id>
- **Observação:** se a tela ainda não existir no Figma, anotar aqui para criação.

> **Regra DoR-G06:** Para tarefas que envolvem frontend, o link do protótipo (Figma) deve estar anexado à tarefa.

---

## Dependências
- **Relacionada a:** #<número>
- **Bloqueada por:** #<número>
- **Bloqueia:** #<número>
- **Nenhuma** — caso não haja dependências.

---

## Notas
- <edge cases, requisitos não-funcionais adicionais, considerações de segurança, decisões de escopo, débitos técnicos, etc.>
