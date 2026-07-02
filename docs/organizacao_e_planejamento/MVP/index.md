<style>
.badge-done { background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; border: 1px solid #c8e6c9; }
.badge-progress { background: #fff3e0; color: #e65100; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; border: 1px solid #ffe0b2; }
.badge-planned { background: #f5f5f5; color: #616161; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; border: 1px solid #e0e0e0; }
.badge-blocked { background: #ffebee; color: #c62828; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; border: 1px solid #ffcdd2; }
</style>

# Matriz de Completude do MVP

## Introdução

Este documento apresenta a Matriz de Completude do Mínimo Produto Viável (MVP) da plataforma Liaison. A tabela mapeia o estado atual de implementação de todos os 24 itens classificados como *Must Have* no Backlog do Produto (21 Histórias de Usuário e 3 Requisitos Não Funcionais). O mapeamento respeita a relação de **1:1 entre RF e US**, servindo como a principal evidência da entrega funcional e do acompanhamento por unidade.

## 1. Status Geral e Separação de Itens (Percentual Baseado em Evidências)

Diferente de estimativas passadas, o status atual é aferido com base em PRs (*Pull Requests*) mergeados, testes de integração passando e features acessíveis na interface:

- **Entregues:** 24 itens (100%)
- **Em Andamento:** 0 itens (0%)
- **Planejados:** 0 itens (0%)
- **Bloqueados:** 0 itens (0%)

**Percentual real do MVP:** **100% Concluído.**

---

## 2. Matriz de Execução do MVP (Evidências)

| # | Req (RF/RNF) | Issues Vinculadas (User Stories) | Release / Unidade | Status | Evidência (Teste / Feedback) | PR(s) Entregues |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | **RNF01** Criptografia | #12 ([US1.1](us1_1.md)), #13 ([US1.2](us1_2.md)), #14 ([US1.3](us1_3.md)) | R1 / Unidade 1 | <span class="badge-done">Entregue</span> | Testes de backend passando; hash bcrypt validado | [PR #57](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/57), [PR #58](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/58) |
| 2 | **RNF04** Responsividade | Coberto nas US visuais | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Layout adaptável Expo (Mobile/Web) aprovado no Figma | [PR #97](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/97), [PR #123](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/123), [PR #124](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/124) |
| 3 | **RNF08** Imutabilidade | #31 ([US3.3](us3_3.md)), #32 ([US3.4](us3_4.md)) | R4 / Unidade 3 | <span class="badge-done">Entregue</span> | Travas e permissões de emissão validadas (pytest) | [PR #116](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/116), [PR #126](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/126) |
| 4 | **RF01** Cadastrar estudante | #12 ([US1.1](us1_1.md)) | R1 / Unidade 1 | <span class="badge-done">Entregue</span> | Payload validado, persistência confirmada | [PR #55](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/55) |
| 5 | **RF02** Cadastrar organização | #13 ([US1.2](us1_2.md)) | R1 / Unidade 1 | <span class="badge-done">Entregue</span> | Moderação e autenticação via CNPJ atestada | [PR #60](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/60), [PR #66](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/66) |
| 6 | **RF03** Autenticar usuário | #14 ([US1.3](us1_3.md)) | R1 / Unidade 1 | <span class="badge-done">Entregue</span> | Persistência de token JWT funcional (Feedback OK) | [PR #57](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/57), [PR #64](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/64) |
| 7 | **RF04** Gerenciar perfil de Estudante | #15 ([US1.4](us1_4.md)) | R1 / Unidade 1 | <span class="badge-done">Entregue</span> | Redesign revisado, forms salvando dados | [PR #65](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/65), [PR #97](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/97), [PR #121](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/121) |
| 8 | **RF05** Gerenciar perfil de Organização | #16 ([US1.5](us1_5.md)) | R1 / Unidade 1 | <span class="badge-done">Entregue</span> | Edição do perfil institucional persistindo corretamente | [PR #97](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/97), [PR #121](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/121) |
| 9 | **RF07** Moderar organização | #18 ([US1.7](us1_7.md)) | R1 / Unidade 1 | <span class="badge-done">Entregue</span> | Bugfixes recentes homologaram aprovação segura | [PR #101](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/101) |
| 10 | **RF21** Criar oportunidade | #19 ([US2.1](us2_1.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Criação e campos submetidos com sucesso | [PR #83](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/83), [PR #99](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/99) |
| 11 | **RF22** Editar oportunidade | #50 ([US2.2](us2_2.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Alterações confirmadas, refletidas na busca | [PR #84](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/84), [PR #99](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/99) |
| 12 | **RF23** Publicar oportunidade | #51 ([US2.3](us2_3.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Alternância de status Visível/Oculta testada | [PR #84](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/84), [PR #99](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/99) |
| 13 | **RF08** Buscar vaga | #20 ([US2.5](us2_5.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Filtros e Dashboard integrados | [PR #87](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/87) |
| 14 | **RF09** Consultar vaga | #21 ([US2.6](us2_6.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Detalhes exibidos corretamente na navegação | [PR #113](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/113) |
| 15 | **RF10** Realizar candidatura | #22 ([US2.7](us2_7.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Action validada via backend e conectada à UI | [PR #113](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/113) |
| 16 | **RF11** Avaliar candidatura | #24 ([US2.8](us2_8.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Auditoria da avaliação e mudança de status OK | [PR #118](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/118) |
| 17 | **RF12** Cancelar candidatura | #23 ([US2.9](us2_9.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Cancelamento refletido em tempo real no tracking | [PR #117](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/117), [PR #124](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/124) |
| 18 | **RF13** Notificar candidatura | #25 ([US2.10](us2_10.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Notificações in-app de mudança de status OK | [PR #120](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/120), [PR #124](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/124) |
| 19 | **RF25** Acompanhar candidaturas | #86 ([US2.11](us2_11.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Tela "Minhas Candidaturas" com filtros por status homologada | [PR #117](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/117), [PR #124](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/124) |
| 20 | **RF27** Visualizar perfil de estudante | #119 ([US2.13](us2_13.md)) | R2 / Unidade 2 | <span class="badge-done">Entregue</span> | Perfil do estudante visível para a organização; issue #119 fechada | [PR #121](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/121), [PR #130](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/130) |
| 21 | **RF14** Listar aprovados | #26 ([US3.1](us3_1.md)) | R4 / Unidade 3 | <span class="badge-done">Entregue</span> | Abas, Avatares, fallback e filtros homologados | [PR #125](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/125), [PR #126](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/126) |
| 22 | **RF15** Registrar frequência | #27 ([US3.2](us3_2.md)) | R4 / Unidade 3 | <span class="badge-done">Entregue</span> | Migração DB 0003, regras tri-state validadas | [PR #126](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/126) |
| 23 | **RF16** Emitir certificado | #31 ([US3.3](us3_3.md)) | R4 / Unidade 3 | <span class="badge-done">Entregue</span> | Geração automática do certificado concluída | [PR #116](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/116) |
| 24 | **RF17** Compartilhar certificado | #32 ([US3.4](us3_4.md)) | R4 / Unidade 3 | <span class="badge-done">Entregue</span> | Exportação do PDF de certificado validada | [PR #116](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/pull/116) |
