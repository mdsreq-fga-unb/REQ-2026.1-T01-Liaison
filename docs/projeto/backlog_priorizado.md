# 11 BACKLOG PRIORIZADO

Esta página apresenta **a listagem priorizada** do backlog do produto Liaison em uma **única sequência de implementação**. A explicação de como o backlog foi estruturado e o método de priorização (MoSCoW → ICE Score → Matriz Esforço × Valor) está na página **[Backlog do Produto](backlog_produto.md)**.

A coluna **Ordem** define a sequência de análise das histórias de usuário (US): primeiro a banda MoSCoW (Must → Should → Could → Won't), depois o ICE Score decrescente dentro de cada banda. A trava MoSCoW é absoluta — nenhum item de banda inferior entra no fluxo antes de esgotar a banda superior, independente do ICE. A sequência é referência; o time ajusta a ordem real no KanbanXP conforme dependências e capacidade da semana.

> **Fonte:** campos personalizados do [GitHub Project #100](https://github.com/orgs/mdsreq-fga-unb/projects/100). Cada item é uma US com issue rastreável no repositório.
>
> **Colunas:** **I** = Impacto, **C** = Confiança, **E** = Facilidade (1–10). **ICE** = I × C × E. **Quadrante** = posição na Matriz Facilidade × Valor (Quick Win, Plan, Later, Drop).

## 11.1 Matriz Facilidade × Valor

O gráfico posiciona cada história de usuário pela **Facilidade (E)** no eixo horizontal e pelo **Valor / Impacto (I)** no eixo vertical, definindo os quadrantes Quick Win, Plan, Later e Drop. Histórias com a mesma coordenada são distribuídas ao redor do ponto real (ligadas por uma linha) para não se sobreporem. Passe o mouse sobre um card para ver título completo e ICE Score.

<iframe src="assets/matriz-facilidade-valor.html" title="Matriz Facilidade × Valor" style="width:100%; height:900px; border:1px solid #e7e3f0; border-radius:12px;" loading="lazy"></iframe>

## 11.2 Sequência priorizada

| Ordem | US | Issue | Descrição | MoSCoW | Quadrante | I | C | E | ICE |
|:---:|:---|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|
| 1 | US1.1 | [#12](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/12) | Cadastro de Estudantes Universitários | Must | Quick Win | 10 | 8 | 7 | **560** |
| 2 | US1.3 | [#14](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/14) | Autenticação de Usuários | Must | Quick Win | 9 | 8 | 7 | **504** |
| 3 | US2.3 | [#51](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/51) | Publicação de Vagas de Voluntariado | Must | Quick Win | 8 | 9 | 7 | **504** |
| 4 | US2.6 | [#21](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/21) | Visualização de Detalhes da Vaga | Must | Quick Win | 8 | 9 | 7 | **504** |
| 5 | US2.13 | [#119](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/119) | Ver Perfil do Estudante | Must | Later | 6 | 9 | 9 | **486** |
| 6 | US2.11 | [#86](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/86) | Acompanhamento de Minhas Candidaturas | Must | Quick Win | 8 | 8 | 7 | **448** |
| 7 | US1.2 | [#13](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/13) | Cadastro de Organizações Sociais | Must | Quick Win | 10 | 7 | 6 | **420** |
| 8 | US2.1 | [#19](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/19) | Criação de Vagas de Voluntariado | Must | Quick Win | 10 | 7 | 5 | **350** |
| 9 | US2.7 | [#22](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/22) | Candidatura em Vaga de Voluntariado | Must | Quick Win | 10 | 7 | 5 | **350** |
| 10 | US1.4 | [#15](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/15) | Gestão de Perfil do Estudante | Must | Quick Win | 7 | 8 | 6 | **336** |
| 11 | US1.5 | [#16](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/16) | Edição de Perfil Institucional da Organização | Must | Quick Win | 7 | 8 | 6 | **336** |
| 12 | US2.2 | [#50](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/50) | Edição de Vagas de Voluntariado | Must | Quick Win | 7 | 8 | 6 | **336** |
| 13 | US3.1 | [#26](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/26) | Listagem de Estudantes Aprovados | Must | Quick Win | 7 | 8 | 6 | **336** |
| 14 | US2.8 | [#24](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/24) | Avaliação de Candidaturas pela Organização | Must | Quick Win | 9 | 7 | 5 | **315** |
| 15 | US1.7 | [#18](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/18) | Painel Administrativo para Moderação de Organizações (Sysmin) | Must | Quick Win | 7 | 7 | 6 | **294** |
| 16 | US3.4 | [#32](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/32) | Exportação de Certificado Digital em PDF | Must | Quick Win | 7 | 7 | 6 | **294** |
| 17 | US3.2 | [#27](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/27) | Registro de Frequência e Carga Horária | Must | Plan | 9 | 7 | 4 | **252** |
| 18 | US2.9 | [#23](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/23) | Cancelamento de Candidatura | Must | Later | 6 | 7 | 6 | **252** |
| 19 | US2.10 | [#25](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/25) | Notificações de Status de Candidatura | Must | Quick Win | 7 | 5 | 5 | **175** |
| 20 | US2.5 | [#20](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/20) | Busca e Filtro de Vagas para Estudantes | Must | Plan | 9 | 6 | 3 | **162** |
| 21 | US3.3 | [#31](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/31) | Geração Automática de Certificado Digital | Must | Plan | 10 | 5 | 3 | **150** |
| 22 | US2.12 | [#111](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/111) | Ver Perfil da Organização | Should | Later | 5 | 9 | 9 | **567** |
| 23 | US2.4 | [#52](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/52) | Encerramento de Vagas de Voluntariado | Should | Later | 6 | 8 | 8 | **384** |
| 24 | US2.14 | [#112](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/112) | Listar Oportunidades Salvas | Should | Later | 4 | 9 | 9 | **324** |
| 25 | US3.6 | [#34](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/34) | Download de Certificados | Should | Later | 6 | 7 | 6 | **252** |
| 26 | US3.5 | [#33](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/33) | Visualização de Histórico de Horas | Should | Quick Win | 7 | 7 | 5 | **245** |
| 27 | US3.7 | [#30](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/30) | Portal Público de Validação de Certificados | Could | Drop | 6 | 5 | 4 | **120** |
| 28 | US1.6 | [#17](https://github.com/mdsreq-fga-unb/REQ-2026.1-T01-Liaison/issues/17) | Recuperação de Senha via E-mail | Won't | Later | 6 | 6 | 7 | **252** |

> **Resumo por banda:** Must Have — 21 itens (ordens 1–21, o MVP). Should Have — 5 itens (22–26). Could Have — 1 item (27). Won't Have — 1 item (28).
>
> **Nota de dependência:** US3.4 e US3.6 (obter certificado em PDF) só executam após US3.3 (geração). O ICE não modela dependência — a cadeia é resolvida no sequenciamento do KanbanXP.
