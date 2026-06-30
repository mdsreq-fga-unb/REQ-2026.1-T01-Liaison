Oi Pedro! Revisei o PR a pedido do Gustavo — ele depende desse merge pra destravar a #22, então não podia ser o revisor. Primeiro, parabéns: é bastante coisa e o fluxo de vagas ficou bem completo. Rodei a suíte localmente (reparei que o PR está sem CI rodando) e foram 337 testes passando. Achei um ponto que precisa de ajuste antes do merge:

BLOQUEANTE — Validação de campo obrigatório na edição
O teste TestEdicaoVagas::test_campos_obrigatorios_nao_podem_ficar_vazios falha: retorna 200 quando deveria ser 400. Na prática, ao editar uma vaga ativa e apagar um campo obrigatório (ex: título), o sistema deixa salvar em vez de bloquear — é o Cenário 3 da #50. Suspeito que o null=True/blank=True que entrou no model pra permitir rascunho acabou removendo a obrigatoriedade também na edição de vaga publicada. Sugestão: validação condicional por status no serializer (rascunho pode ficar incompleto; ativa/publicada não).

NÃO É DESTE PR (só pra você não se assustar com o vermelho): tem ~10 testes de login por CNPJ e moderação falhando, mas confirmei rodando na develop que eles já falhavam antes do seu PR. É dívida antiga — vou abrir uma issue separada, não precisa mexer nisso aqui.

DÚvIDA DE ESCOPO: entrou um "deletar vaga". As issues pedem encerrar (status closed) e as US falam em preservar candidaturas pro histórico. O delete físico é intencional? Se for só pra limpar rascunho, talvez valha restringir a rascunhos.

NIT (opcional): o Pillow está duplicado no requirements.txt.

Quando ajustar o ponto bloqueante, me marca que eu re-rodo os testes. Valeu!