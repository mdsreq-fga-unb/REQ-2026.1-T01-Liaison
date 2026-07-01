<style>
.badge-done { background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; border: 1px solid #c8e6c9; }
.badge-progress { background: #fff3e0; color: #e65100; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; border: 1px solid #ffe0b2; }
.badge-planned { background: #f5f5f5; color: #616161; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; border: 1px solid #e0e0e0; }
.badge-blocked { background: #ffebee; color: #c62828; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; border: 1px solid #ffcdd2; }
</style>

# Quadro de MVP (Evidências e Status)

Este documento apresenta a Matriz de Completude do Mínimo Produto Viável (MVP) da plataforma Liaison. A tabela mapeia o estado de implementação de todos os itens classificados como *Must Have* no Backlog do Produto, servindo como a principal evidência da entrega funcional.

## Status Geral do MVP

Com base nos PRs (*Pull Requests*) concluídos e homologados no repositório, o status consolidado do MVP é:

- **Entregues:** 19 itens (100%)
- **Em Andamento:** 0 itens (0%)
- **Planejados:** 0 itens (0%)

**Percentual real do MVP:** **100% Concluído.**

## Matriz de Execução do MVP

| # | Req (RF/RNF) | Issues Vinculadas (User Stories) | Release (Planejamento) | Status | Evidência (Teste / Funcionalidade) | PR(s) Entregues |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | **RNF01** Criptografia | #12 (US1.1), #13 (US1.2), #14 (US1.3) | R1 | <span class="badge-done">Entregue</span> | Testes de backend passando; hash bcrypt validado | PR #57, #58 |
| 2 | **RNF04** Responsividade | Coberto nas US visuais | R2 | <span class="badge-done">Entregue</span> | Layout adaptável Expo (Mobile/Web) validado | PR #97, #123, #124 |
| 3 | **RNF08** Imutabilidade | #31 (US3.3), #32 (US3.4) | R4 | <span class="badge-done">Entregue</span> | Travas e permissões de emissão validadas | PR #116, #126 |
| 4 | **RF01** Cadastrar estudante | #12 (US1.1) | R1 | <span class="badge-done">Entregue</span> | Payload validado, persistência confirmada | PR #55 |
| 5 | **RF02** Cadastrar org. | #13 (US1.2) | R1 | <span class="badge-done">Entregue</span> | Moderação e autenticação via CNPJ atestada | PR #60, #66 |
| 6 | **RF03** Autenticar usuário | #14 (US1.3) | R1 | <span class="badge-done">Entregue</span> | Persistência de token JWT funcional | PR #57, #64 |
| 7 | **RF04** Gerenciar perfil | #15 (US1.4), #16 (US1.5) | R1 | <span class="badge-done">Entregue</span> | Redesign revisado, forms salvando dados | PR #65, #97, #121 |
| 8 | **RF06** Moderar org. | #18 (US1.7) | R2 | <span class="badge-done">Entregue</span> | Aprovação segura de orgs pela administração | PR #101 |
| 9 | **RF08** Buscar vaga | #20 (US2.5) | R2 | <span class="badge-done">Entregue</span> | Filtros e Dashboard integrados | PR #87 |
| 10 | **RF09** Consultar vaga | #21 (US2.6) | R2 | <span class="badge-done">Entregue</span> | Detalhes exibidos corretamente na UI | PR #113 |
| 11 | **RF10** Fazer candidatura | #22 (US2.7) | R2 | <span class="badge-done">Entregue</span> | Action validada via backend e conectada à UI | PR #113 |
| 12 | **RF11** Avaliar candidatura | #24 (US2.8) | R3 | <span class="badge-done">Entregue</span> | Auditoria da avaliação e mudança de status OK | PR #118 |
| 13 | **RF12** Acompanhar status | #23 (US2.9), #25 (US2.10), #86 (US2.11) | R3 | <span class="badge-done">Entregue</span> | Redesign do tracking e notificações in-app OK | PR #117, #120, #124 |
| 14 | **RF13** Listar aprovados | #26 (US3.1) | R4 | <span class="badge-done">Entregue</span> | Abas, Avatares, fallback e filtros homologados | PR #125, #126 |
| 15 | **RF14** Registrar frequência | #27 (US3.2) | R4 | <span class="badge-done">Entregue</span> | Migração DB, regras tri-state validadas | PR #126 |
| 16 | **RF15** Emitir certificado | #31 (US3.3), #32 (US3.4) | R4 | <span class="badge-done">Entregue</span> | Geração final de layout PDF concluída | PR #116 |
| 17 | **RF18** Criar oportunidade | #19 (US2.1) | R2 | <span class="badge-done">Entregue</span> | Criação e campos submetidos com sucesso | PR #83, #99 |
| 18 | **RF19** Editar oportunidade | #50 (US2.2) | R2 | <span class="badge-done">Entregue</span> | Alterações confirmadas, refletidas na busca | PR #84, #99 |
| 19 | **RF20** Publicar oport. | #51 (US2.3) | R2 | <span class="badge-done">Entregue</span> | Alternância de status Visível/Oculta testada | PR #84, #99 |
