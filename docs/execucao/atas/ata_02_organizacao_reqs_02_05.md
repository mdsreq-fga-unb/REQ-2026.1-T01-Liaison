# Ata de Reunião: Organização e Modelagem de Requisitos

**📌 O que esta ata e o vídeo abaixo evidenciam?**
> Esta ata e vídeo servem como evidência de **Planejamento da Sprint e Organização Interna** da equipe.


## 📹 Gravação do Encontro
*(Substitua pelo link real do Drive ou YouTube)*
<iframe width="100%" height="400" src="https://www.youtube.com/embed/SEU_LINK_AQUI" title="Gravação da Reunião" frameborder="0" allowfullscreen></iframe>

---

## 📝 Resumo Executivo

**Data:** 02/05/2026  
**Duração:** ~45 minutos  
**Participantes:** Equipe Liaison

### 🎯 Tópicos Discutidos e Decisões
* **Fluxo de Cadastro de Organizações:** Decisão de Arquitetura. Para reduzir esforço e aumentar a segurança, o cadastro não será livre. As organizações se registrarão, mas a aprovação será feita via painel administrativo (Admin do Sistema).
* **Gestão de Perfil e Fotos:** A equipe debateu a inclusão de fotos de perfil e galerias para as oportunidades. Apesar da complexidade de infraestrutura (integração com S3/Bitbucket), a decisão foi manter o requisito devido ao alto valor gerado na "humanização" da plataforma para os estudantes.
* **Complexidade do Login:** O fluxo de autenticação foi avaliado como de baixo esforço, estabelecendo a base para o uso de tokens (JWT) tanto para estudantes quanto para as organizações.
