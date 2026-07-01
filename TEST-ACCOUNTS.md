# Contas de Teste

## Organizações

| Nome | CNPJ | Senha | Status |
|------|------|-------|--------|
| Instituto Aprender Mais | `11222333000181` | `Demo1234` | approved |
| Instituto Cultura Viva | `45123456000187` | `test1234` | approved |
| Saúde em Ação | `62048813000109` | `test1234` | pending |
| Code Futuro | `12345678000195` | `test1234` | rejected |

> Orgs `pending` e `rejected` não conseguem fazer login (bloqueado pela API).

## Estudante

| Email | Senha |
|-------|-------|
| `aluno.demo@liaison.dev` | `Demo1234` |

## Notas

- Instituto Aprender Mais tem 7 vagas vinculadas (seed_opportunities).
- Demais orgs sem vagas.
- Recriar: `python manage.py seed_opportunities` (org demo) + script `seed_orgs.py` no scratchpad.
