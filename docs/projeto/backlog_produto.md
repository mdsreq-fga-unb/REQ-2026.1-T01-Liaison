# 10. Backlog do Produto

## 10.1 Estrutura e Fundamento

O Backlog do Liaison segue hierarquia orientada a valor: **Épico → Feature → História de Usuário → Critério de Aceitação**. Fundamenta-se na Seção 9.6 de Marsicano (2026), segundo o qual frameworks ágeis partem de objetivos estratégicos e os refinam progressivamente até incrementos implementáveis. As histórias adotam o formato *"Como \<usuário\>, Quero \<objetivo\>, Para \<benefício\>"* (Seção 9.4.3.1) e os critérios de aceitação utilizam o padrão *Dado / Quando / Então* (Seção 9.4.2.4), tornando cada item verificável e testável.

---

## 10.2 Épicos do Produto

| ID | Épico | Características de Produto | Objetivos Específicos |
|---|---|---|---|
| **EP01** | **Gestão de Identidade** — Registro, autenticação e gerenciamento de perfis de estudantes e organizações. | CP01 – Cadastro: registro e identificação de todos os atores da plataforma | OE02 – Permitir que organizações e estudantes se cadastrem e gerenciem dados de forma autônoma |
| **EP02** | **Ciclo de Vagas e Engajamento** — Publicação de vagas, busca personalizada e fluxo completo de candidatura e seleção. | CP02 – Gestão de oportunidades; CP03 – Descoberta de oportunidades; CP04 – Inscrição em atividades | OE01 – Facilitar busca e descoberta de vagas compatíveis; OE02 – Permitir gestão autônoma pelas organizações |
| **EP03** | **Acompanhamento e Certificação** — Registro de presença e emissão automatizada de certificados digitais em PDF. | CP05 – Controle de presença; CP06 – Emissão de certificados digitais | OE03 – Automatizar emissão de certificados; OE04 – Prover controle de presença dos voluntários |

---

## 10.3 Histórias de Usuário e Critérios de Aceitação

### EP01 — Gestão de Identidade

**FT01 — Cadastro e Autenticação de Estudantes**

**US01 — Cadastro de Estudante**
> Como estudante universitário, quero criar uma conta com meus dados acadêmicos, para ter acesso às vagas de voluntariado e registrar minhas horas.

| Cenário | Dado / Quando / Então |
|---|---|
| Cadastro com dados válidos | **Dado** que o estudante preenche nome, e-mail, senha, IES e curso, **Quando** clica em "Finalizar Cadastro", **Então** o sistema cria a conta e envia e-mail de confirmação. |
| E-mail já cadastrado | **Dado** que o e-mail já existe na plataforma, **Quando** tenta concluir o cadastro, **Então** o sistema exibe "E-mail já cadastrado. Faça login ou recupere sua senha." |
| Campo obrigatório em branco | **Dado** que ao menos um campo obrigatório está vazio, **Quando** clica em "Finalizar Cadastro", **Então** o sistema destaca o campo e exibe "Campo obrigatório". |

**US02 — Login de Estudante**
> Como estudante cadastrado, quero fazer login com e-mail e senha, para acessar meu painel de oportunidades.

| Cenário | Dado / Quando / Então |
|---|---|
| Login bem-sucedido | **Dado** que o estudante informa e-mail e senha corretos, **Quando** clica em "Entrar", **Então** o sistema autentica e redireciona para o painel do estudante. |
| Credenciais inválidas | **Dado** que a senha está incorreta, **Quando** tenta login, **Então** o sistema exibe "E-mail ou senha inválidos." sem indicar qual dos dois está errado. |
| Conta não confirmada | **Dado** que o estudante não confirmou o e-mail, **Quando** tenta login, **Então** o sistema exibe "Confirme seu e-mail antes de acessar." com opção de reenvio do link. |

**US03 — Recuperação de Senha**
> Como estudante que esqueceu a senha, quero redefini-la pelo e-mail cadastrado, para recuperar o acesso sem criar nova conta.

| Cenário | Dado / Quando / Então |
|---|---|
| Solicitação com e-mail válido | **Dado** que o estudante informa e-mail cadastrado, **Quando** clica em "Enviar link", **Então** o sistema envia link de redefinição válido por 30 minutos. |
| E-mail não cadastrado | **Dado** que o e-mail não existe na plataforma, **Quando** clica em "Enviar link", **Então** o sistema exibe "Se este e-mail estiver cadastrado, você receberá o link." — sem confirmar nem negar a existência (proteção LGPD). |

---

**FT02 — Cadastro e Autenticação de Organizações**

**US04 — Cadastro de Organização Social**
> Como representante de uma organização social, quero cadastrar minha entidade na plataforma, para criar um perfil institucional e publicar vagas de voluntariado.

| Cenário | Dado / Quando / Então |
|---|---|
| Cadastro com dados válidos | **Dado** que o representante preenche nome, e-mail, senha e área de atuação, **Quando** conclui o cadastro, **Então** a conta é criada com status "Ativa" e e-mail de confirmação é enviado. |
| CNPJ opcional para entidades informais | **Dado** que a organização não possui CNPJ formal, **Quando** o representante desmarca "Possuo CNPJ", **Então** o campo some e o cadastro prossegue com declaração de responsabilidade — garantindo inclusão de igrejas e grupos comunitários como a do Pastor Valdemir. |

**US05 — Login de Organização**
> Como representante de organização cadastrada, quero fazer login com e-mail e senha, para acessar o painel de gestão de vagas e voluntários.

| Cenário | Dado / Quando / Então |
|---|---|
| Login bem-sucedido | **Dado** que o representante informa credenciais corretas, **Quando** clica em "Entrar", **Então** o sistema autentica e redireciona para o painel da organização, visualmente distinto do painel do estudante. |
| Credenciais inválidas | **Dado** que os dados estão incorretos, **Quando** tenta entrar, **Então** o sistema exibe "E-mail ou senha inválidos." e não concede acesso. |

---

### EP02 — Ciclo de Vagas e Engajamento

**FT04 — Publicação e Gestão de Vagas**

**US07 — Criação de Vaga de Voluntariado**
> Como representante de organização social autenticada (Pastor Valdemir), quero criar uma vaga informando título, descrição, área, carga horária e data, para divulgar a oportunidade e encontrar voluntários sem depender de canais como WhatsApp.

| Cenário | Dado / Quando / Então |
|---|---|
| Vaga criada com sucesso | **Dado** que a organização preenche os campos obrigatórios, **Quando** clica em "Publicar Vaga", **Então** a vaga é criada como "Ativa" e fica visível imediatamente na listagem pública. |
| Campo obrigatório ausente | **Dado** que ao menos um campo obrigatório está vazio, **Quando** tenta publicar, **Então** o sistema destaca os campos e exibe "Preencha todos os campos obrigatórios." |
| Carga horária zero | **Dado** que o representante informa 0 horas, **Quando** tenta publicar, **Então** o sistema exibe "A carga horária deve ser maior que zero." |

**US08 — Encerramento de Vaga**
> Como representante de organização, quero encerrar uma vaga quando a atividade for concluída ou as vagas preenchidas, para evitar novas inscrições sem capacidade.

| Cenário | Dado / Quando / Então |
|---|---|
| Encerramento manual | **Dado** que a vaga está "Ativa", **Quando** o representante confirma o encerramento, **Então** a vaga muda para "Encerrada", sai da listagem pública e permanece no histórico da organização. |
| Inscritos pendentes no encerramento | **Dado** que há inscrições "Aguardando aprovação", **Quando** a vaga é encerrada, **Então** os estudantes pendentes recebem notificação: "A vaga foi encerrada e sua inscrição foi cancelada." |

---

**FT05 — Busca e Descoberta de Vagas**

**US09 — Busca de Vagas pelo Estudante**
> Como estudante, quero buscar vagas filtrando por área de atuação e carga horária, para encontrar oportunidades compatíveis com minha rotina acadêmica.

| Cenário | Dado / Quando / Então |
|---|---|
| Busca com filtro | **Dado** que o estudante aplica ao menos um filtro, **Quando** executa a busca, **Então** o sistema exibe apenas vagas ativas correspondentes, ordenadas pela data de publicação mais recente. |
| Sem resultados | **Dado** que os filtros não correspondem a nenhuma vaga ativa, **Quando** a busca é executada, **Então** o sistema exibe "Nenhuma vaga encontrada. Tente ampliar os critérios." |
| Detalhes da vaga | **Dado** que o estudante clica em uma vaga, **Quando** a página de detalhes carrega, **Então** o sistema exibe: título, descrição, organização, área, carga horária, data e vagas disponíveis. |

---

**FT06 — Candidatura e Gestão de Inscrições**

**US10 — Inscrição em Vaga pelo Estudante**
> Como estudante, quero me inscrever em uma vaga com um clique, para manifestar interesse e aguardar confirmação da organização.

| Cenário | Dado / Quando / Então |
|---|---|
| Inscrição realizada | **Dado** que a vaga está ativa com vagas disponíveis, **Quando** o estudante clica em "Quero participar", **Então** o sistema registra a inscrição como "Aguardando aprovação" e exibe "Inscrição enviada!" |
| Vagas esgotadas | **Dado** que todas as vagas foram preenchidas, **Quando** o estudante tenta se inscrever, **Então** o sistema exibe "Vagas esgotadas para esta atividade." |
| Inscrição duplicada | **Dado** que o estudante já está inscrito, **Quando** tenta se inscrever novamente, **Então** o sistema exibe "Você já está inscrito nesta atividade." |

**US11 — Aprovação de Inscrição pela Organização**
> Como representante de organização, quero aprovar ou recusar inscrições recebidas, para controlar quem participará da atividade.

| Cenário | Dado / Quando / Então |
|---|---|
| Aprovação | **Dado** que há inscrição "Aguardando aprovação", **Quando** o representante aprova, **Então** o status muda para "Confirmado" e o estudante recebe notificação de confirmação. |
| Recusa | **Dado** que o representante recusa, **Quando** confirma a ação, **Então** o status muda para "Recusado" e o estudante é notificado. |

---

### EP03 — Acompanhamento e Certificação Acadêmica

**FT07 — Registro de Presença**

**US12 — Confirmação de Presença pela Organização**
> Como representante de organização (Pastor Valdemir), quero registrar a presença dos estudantes e a carga horária efetiva, para atestar formalmente a atividade e viabilizar a emissão do certificado sem papelada.

| Cenário | Dado / Quando / Então |
|---|---|
| Registro bem-sucedido | **Dado** que a atividade foi concluída e o representante seleciona os presentes com carga horária, **Quando** clica em "Confirmar Presença", **Então** o sistema registra status "Presença Confirmada" e dispara a emissão do certificado. |
| Presença parcial | **Dado** que nem todos os inscritos compareceram, **Quando** o representante marca apenas os presentes, **Então** somente os marcados têm presença registrada e certificado gerado. |
| Correção de registro | **Dado** que houve erro no registro, **Quando** o representante edita dentro de 48h, **Então** o sistema permite a correção e reprocessa o certificado se necessário. |

---

**FT08 — Emissão Automatizada de Certificados**

**US13 — Geração Automática do Certificado**
> Como estudante com presença confirmada, quero receber automaticamente um certificado em PDF com meus dados e a carga horária realizada, para ter o comprovante pronto para entrega na minha universidade sem solicitar nada manualmente.

| Cenário | Dado / Quando / Então |
|---|---|
| Geração automática | **Dado** que a organização confirma a presença, **Quando** o processo é concluído, **Então** o sistema gera PDF contendo: nome do estudante, identificação da organização, título da atividade, data e carga horária efetiva. |
| Download do certificado | **Dado** que o certificado foi gerado, **Quando** o estudante acessa "Meus Certificados" e clica em "Baixar", **Então** o PDF fica disponível com o selo da organização e a carga horária validada. |
| Código rastreável | **Dado** que o certificado foi gerado, **Quando** qualquer pessoa visualiza o documento, **Então** ele contém um código único de verificação que identifica aquele registro — garantindo autenticidade para a IES. |

**US14 — Histórico de Atividades e Certificados**
> Como estudante, quero visualizar um histórico de todas as atividades realizadas e certificados emitidos, para controlar minhas horas acumuladas e acessar comprovantes para entrega à IES.

| Cenário | Dado / Quando / Então |
|---|---|
| Histórico preenchido | **Dado** que o estudante acessa "Meu Histórico", **Quando** a página carrega, **Então** o sistema exibe todas as atividades com: organização, título, data, carga horária e status do certificado, e o total de horas em destaque no topo. |
| Histórico vazio | **Dado** que o estudante não tem atividades concluídas, **Quando** acessa o histórico, **Então** o sistema exibe "Você ainda não tem atividades concluídas. Encontre oportunidades e comece sua jornada!" |

---

## 10.4 Rastreabilidade e Valor

| Épico | Feature | Histórias | Característica de Produto | Objetivo Específico |
|---|---|---|---|---|
| EP01 – Gestão de Identidade | FT01 – Cadastro/Auth Estudante | US01, US02, US03 | CP01 – Cadastro: registro e identificação de estudantes | OE02 – Estudantes cadastram-se de forma autônoma |
| EP01 – Gestão de Identidade | FT02 – Cadastro/Auth Organização | US04, US05 | CP01 – Cadastro: registro e identificação de organizações | OE02 – Organizações cadastram-se de forma autônoma |
| EP02 – Ciclo de Vagas | FT04 – Publicação de Vagas | US07, US08 | CP02 – Gestão de oportunidades: criação e gestão de vagas | OE02 – Organizações gerenciam vagas de forma autônoma |
| EP02 – Ciclo de Vagas | FT05 – Busca e Descoberta | US09 | CP03 – Descoberta: busca de vagas por filtros e interesses | OE01 – Estudante descobre vagas compatíveis com seu perfil |
| EP02 – Ciclo de Vagas | FT06 – Candidatura e Inscrições | US10, US11 | CP04 – Inscrição: candidatura e aprovação do fluxo de voluntariado | OE01 – Facilitar adesão; OE02 – Facilitar gestão pelas organizações |
| EP03 – Certificação | FT07 – Registro de Presença | US12 | CP05 – Controle de presença: registro de frequência nas atividades | OE04 – Prover controle de presença dos voluntários |
| EP03 – Certificação | FT08 – Emissão de Certificados | US13, US14 | CP06 – Emissão de certificados: geração e envio digital de comprovantes | OE03 – Automatizar a emissão de certificados digitais |

Cada história mitiga uma frustração real identificada na elicitação: o estudante que busca vagas de forma dispersa, o Pastor que gerencia voluntários por WhatsApp, a IES que valida horas com documentos inconsistentes. Os critérios de aceitação foram escritos para coletar o mínimo de dados necessário (LGPD), e o cadastro de organização (US04) acomoda entidades sem CNPJ, mitigando o risco de exclusão digital identificado na Seção 3.4.

| Nível | Qtd. |
|---|---|
| Épicos | 3 |
| Features | 8 |
| Histórias de Usuário | 14 |
| Critérios de Aceitação | 38 |

> **Referência de lastro:** Seções 9.4.2.4 (Dado/Quando/Então), 9.4.2.6 (Critérios de Aceitação), 9.4.3.1 (Histórias de Usuário) e 9.6 (Organização de Backlog) — **Requisitos de Software – Comunicação é tudo!** (MARSICANO, 2026, p. 172–184).
