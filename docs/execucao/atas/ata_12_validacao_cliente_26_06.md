# Ata de Reunião: Validação Parcial e Fluxos da Organização

**📌 O que esta ata e o vídeo abaixo evidenciam?**
> Esta ata e gravações servem como evidência de **Validação de Software Funcional** (liberação de release parcial) e **Validação de Requisito** (Ajuste de Critérios de Aceite BDD).

---

## 📝 Resumo Executivo

**Data:** 26/06/2026  
**Duração:** ~55 minutos  
**Participantes:** Equipe Liaison

### 🎯 Tópicos Discutidos e Decisões
* **Validação Assíncrona com Cliente:** Como estratégia para contornar problemas de agenda, a equipe concordou em liberar um protótipo funcional/release menor (focado no painel de organização e avaliação de candidaturas) para que o cliente o manipule no celular e envie a aprovação via WhatsApp.
* **Ajuste nos Critérios de Aceite:** O professor Jorge pontuou a falta de critérios formais. A equipe decidiu, então, transformar os cenários BDD elicitados nas histórias de usuário (US) diretamente em Critérios de Aceite explícitos nas descrições de todos os Pull Requests (ex: PR #99).
* **Dependências de PRs:** Resolução de gargalos entre a issue 22 (Candidatura em Vaga - Gustavo), a issue 24 (Avaliação de candidatura - Luiz) e a issue 51 (Publicar Vaga - Henrique). O PR #99 englobou a junção dessas features cruciais de criação de vaga para liberar o teste na branch develop.
