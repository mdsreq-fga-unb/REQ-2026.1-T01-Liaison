# 11 RASTREABILIDADE INTEGRADA

Esta seção consolida em uma única visão a cadeia completa de rastreabilidade do projeto Liaison, desde o problema identificado até as histórias de usuário e requisitos não funcionais associados. O objetivo é eliminar a necessidade de navegar entre múltiplas páginas para compreender as relações entre os artefatos.

---

## 11.1 Cadeia de Rastreabilidade

`Problema → Objetivos Específicos (OE) → Características do Produto (CP) → Requisitos Funcionais (RF) → Histórias de Usuário (US) → Requisitos Não Funcionais (RNF)`

---

## 11.2 Problemas Identificados

| ID | Problema |
| :--- | :--- |
| **P01** | Estudantes universitários não dispõem de um canal único para localizar, se inscrever e obter comprovante de atividades de voluntariado. |
| **P02** | ONGs e entidades sociais não possuem ferramentas para publicar vagas, receber inscrições, registrar presença e emitir comprovantes em um único sistema. |

---

## 11.3 Objetivos Específicos

| ID | Objetivo Específico | Problema atendido |
| :--- | :--- | :--- |
| **OE01** | Conectar estudantes e organizações de forma centralizada, facilitando o fluxo de publicação, descoberta e gestão de inscrições em oportunidades de voluntariado. | P01, P02 |
| **OE02** | Automatizar o fluxo de comprovação acadêmica das atividades extracurriculares, unificando o controle de participação e a emissão de certificados digitais. | P01, P02 |

---

## 11.4 Matriz de Rastreabilidade Completa

### CP01 — Gestão de Usuários e Entidades

**Objetivo principal:** OE01 | **Contribuição secundária:** OE02

| RF | Nome | História de Usuário | RNFs |
| :--- | :--- | :--- | :--- |
| RF01 | Cadastrar estudante | US001.1 Como estudante universitário, desejo me cadastrar na plataforma para poder buscar e me candidatar a vagas de voluntariado. | RNF01, RNF02 |
| RF02 | Cadastrar organização | US001.2 Como representante de uma organização social, desejo cadastrar minha organização na plataforma para poder publicar vagas de voluntariado. | RNF01, RNF03 |
| RF03 | Autenticar usuário | US001.3 Como usuário, desejo fazer login na plataforma de forma segura para acessar funcionalidades específicas do meu perfil. | RNF01, RNF02 |
| RF04 | Gerenciar perfil | US001.4 Como estudante, desejo gerenciar e editar meu perfil para manter minhas informações atualizadas.<br>US001.5 Como organização, desejo editar meu perfil institucional para manter as informações atualizadas. | RNF04 |
| RF05 | Recuperar senha | US001.6 Como usuário, desejo recuperar minha senha via e-mail para acessar minha conta caso esqueça a senha. | RNF01 |
| RF06 | Moderar organização | US001.7 Como administrador, desejo ter um painel para moderar cadastros de organizações sociais para garantir a legitimidade das organizações. | RNF04 |

### CP02 — Ciclo de Vagas e Engajamento

**Objetivo principal:** OE01 | **Contribuição secundária:** OE02

| RF | Nome | História de Usuário | RNFs |
| :--- | :--- | :--- | :--- |
| RF18 | Criar oportunidade | US002.1 Como organização, desejo criar novas vagas de voluntariado para atrair estudantes interessados. | RNF04, RNF06 |
| RF19 | Editar oportunidade | US002.2 Como organização, desejo editar informações de vagas existentes para mantê-las atualizadas. | RNF04 |
| RF20 | Publicar oportunidade | US002.3 Como organização, desejo publicar vagas para que fiquem visíveis aos estudantes. | RNF04 |
| RF21 | Encerrar oportunidade | US002.4 Como organização, desejo encerrar vagas quando não houver mais necessidade. | RNF04 |
| RF08 | Buscar vaga | US002.5 Como estudante, desejo buscar e filtrar vagas para encontrar oportunidades que correspondam ao meu interesse e disponibilidade. | RNF04, RNF05, RNF06 |
| RF09 | Consultar vaga | US002.6 Como estudante, desejo visualizar os detalhes completos de uma vaga para decidir se devo me candidatar. | RNF04 |
| RF10 | Realizar candidatura | US002.7 Como estudante, desejo me candidatar a uma vaga ativa para participar das atividades da organização. | RNF04, RNF06 |
| RF11 | Avaliar candidatura | US002.8 Como organização, desejo avaliar as candidaturas dos estudantes para aprovar ou recusar participantes. | RNF04, RNF06 |
| RF12 | Acompanhar candidatura | US002.9 Como estudante, desejo cancelar minha candidatura caso não tenha mais interesse ou disponibilidade.<br>US002.10 Como usuário, desejo receber notificações sobre mudanças de status de candidaturas. | RNF04 |

### CP03 — Acompanhamento e Certificação Acadêmica

**Objetivo principal:** OE02 | **Contribuição secundária:** OE01

| RF | Nome | História de Usuário | RNFs |
| :--- | :--- | :--- | :--- |
| RF13 | Listar aprovados | US003.1 Como organização, desejo visualizar a lista de estudantes aprovados para gerenciar acompanhamento e presença. | RNF04, RNF08 |
| RF14 | Registrar frequência | US003.2 Como organização, desejo registrar a presença e atestar a carga horária dos estudantes aprovados. | RNF04, RNF08 |
| RF15 | Emitir certificado | US003.3 Como estudante, desejo receber automaticamente meu certificado digital em PDF ao concluir uma atividade.<br>US003.4 Como estudante, desejo exportar meus certificados digitais em PDF para comprovação acadêmica. | RNF07, RNF08, RNF09 |
| RF16 | Consultar histórico | US003.5 Como estudante, desejo visualizar meu histórico de horas de voluntariado para acompanhar minha evolução.<br>US003.6 Como estudante, desejo fazer download dos meus certificados para comprovação acadêmica. | RNF04, RNF07, RNF08 |
| RF17 | Validar certificado | US003.7 Como qualquer pessoa, desejo acessar um portal público para validar a autenticidade de um certificado por URL ou QR Code. | RNF07, RNF09 |

---

## 11.5 Rastreabilidade dos RNFs

| ID | Classificação URPS+ | Descrição resumida | RFs impactados |
| :--- | :--- | :--- | :--- |
| RNF01 | Segurança | bcrypt com work factor ≥ 12 | RF01, RF02, RF03, RF05 |
| RNF02 | Desempenho | Login ≤ 2s sob 100 req. simultâneas | RF01, RF03 |
| RNF03 | Confiabilidade | Validação de CNPJ com dígitos verificadores | RF02 |
| RNF04 | Usabilidade | Responsivo em iOS 16+ e Android 10+, tela ≥ 360px | RF04, RF06, RF08, RF09, RF10, RF11, RF12, RF13, RF14, RF16 |
| RNF05 | Desempenho | Busca ≤ 3s com até 5 filtros, 200 req. simultâneas | RF08 |
| RNF06 | Desempenho | Suporte a 1.000 usuários simultâneos, resp. ≤ 5s | RF08, RF10, RF11 |
| RNF07 | Suportabilidade | Geração assíncrona de PDF em até 30s | RF15, RF16, RF17 |
| RNF08 | Segurança | Imutabilidade de certificados e frequências no banco | RF13, RF14, RF15, RF16 |
| RNF09 | Confiabilidade | UUID v4 (RFC 4122) para certificados | RF15, RF17 |
