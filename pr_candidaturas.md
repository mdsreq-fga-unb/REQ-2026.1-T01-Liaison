## O que é

Tela "Minhas Candidaturas" (#23) — front construído e funcional, com dados MOCKADOS. Pronta pra integração com a API de candidatura (#22).

## O que já funciona (com mock)

- Lista de candidaturas em cards (cabeçalho azul + cards)
- Badge de status colorido por situação: PENDENTE (laranja), APROVADA (verde), RECUSADA (vermelho), CANCELADA (cinza)
- Botão "Cancelar" visível apenas em candidaturas PENDENTES (regra da #23)
- Modal de confirmação ("Cancelar candidatura?" / "Voltar" / "Sim, cancelar") com o nome da vaga
- Ao confirmar, o card muda para CANCELADA (localmente, no mock)

## O que falta integrar (Gustavo)

O mock está no início de `MyApplicationsScreen.tsx`, na constante `candidaturas` (useState com 4 itens fixos). Pra plugar na API real:

1. **Listar:** trocar o mock por uma chamada ao `getMyApplications` (do teu PR #113). Hoje a tela espera os campos: `vaga` (título da vaga), `organizacao` (nome da org), `data` (texto da data), `status`.
2. **Status:** o mock usa os valores em maiúsculo/português (`PENDENTE`, `APROVADA`, `RECUSADA`, `CANCELADA`). Se o backend usa outro formato (ex: `pending`/`approved`), precisa mapear — a função `getStatusStyle` é onde os status são tratados.
3. **Cancelar:** hoje o "Sim, cancelar" só altera o estado local. Precisa ligar ao endpoint de cancelamento (a #23 sugere `PATCH /api/v1/applications/{id}/cancel/`).

## Observações

- Navegação: a tela está registrada no `StudentStack` mas NÃO é a tela inicial (a StudentHome segue como inicial). Falta ligar o acesso pela aba "Inscrições" da tab bar.
- Ainda não tem: abas de filtro (Todas/Pendentes/...) e estado vazio — estão no protótipo mas não foram implementados.
- Dúvidas de contrato (nomes de campos, valores de status, endpoint de cancelar) podem ser resolvidas direto contra o teu backend do #113.

Resolves #23 (parte frontend)