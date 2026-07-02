# User Stories a Alterar — Critérios de Aceite & Cenários

> Foco em **critérios de aceite / cenários de teste (BDD)** que estão fora de sincronia com o código. Requisitos técnicos ficam para um momento posterior. As US não listadas já estão sincronizadas.

---

## US1.6 — #17 — Recuperação de Senha via E-mail
**Problema:** os 5 cenários BDD estão escritos como funcionalidade **entregue**, mas o fluxo não existe no código (não há reset por e-mail). MoSCoW = Won't / status = Q/A.

**Alterar cenários:** marcar os 5 cenários como **"Planejado — release futura"** (ou mover para uma seção "Cenários Futuros"), para não parecer entregue:
- Cenário 1: Solicitação de recuperação de senha
- Cenário 2: E-mail não cadastrado
- Cenário 3: Link de redefinição válido
- Cenário 4: Link expirado
- Cenário 5: Nova senha igual à anterior

---

## US3.4 — #32 — Exportação de Certificado Digital em PDF
**Problema:** cenários descrevem comportamento que o código não entrega.

**Alterar cenários:**
- **Cenário 2 — Exportação de múltiplos certificados (arquivo .zip):** não implementado (só existe download individual). → rebaixar para **"Planejado"** OU implementar a exportação em lote.
- **Cenário 3 — Visualização prévia em visualizador integrado ao app:** entregue apenas de forma parcial (o download abre o PDF no visualizador do dispositivo/navegador, não em viewer in-app). → ajustar o texto do cenário para refletir o comportamento real, ou marcar o viewer in-app como "Planejado".

Cenário 1 (download individual), 4 e 5 já estão sincronizados.

---

## US2.1 — #19 — Criação de Vagas de Voluntariado
**Problema:** o código cria vagas com **modalidade** (presencial/remoto/híbrido) e **recorrência** (vaga recorrente + duração de sessão), mas nenhum cenário de aceite cobre isso.

**Adicionar cenários:**
- Cenário: Criação de vaga informando a **modalidade** (presencial / remoto / híbrido).
- Cenário: Criação de vaga **recorrente**, definindo a duração de cada sessão.

---

## US2.5 — #20 — Busca e Filtro de Vagas para Estudantes
**Problema:** o código permite **filtrar por modalidade**, mas não há cenário cobrindo esse filtro.

**Adicionar cenário:**
- Cenário: Filtro de vagas por **modalidade** (ex.: exibir só vagas remotas).

---

## US2.6 — #21 — Visualização de Detalhes da Vaga
**Problema:** o detalhe da vaga exibe **modalidade** e **recorrência**, mas os cenários não mencionam esses dados.

**Adicionar/ajustar cenário:**
- Ajustar o Cenário 1 (visualização com todos os detalhes) para incluir **modalidade** e **recorrência** entre as informações exibidas.
