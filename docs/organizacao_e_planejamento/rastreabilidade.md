# Rastreabilidade de Requisitos

A rastreabilidade garante que cada funcionalidade desenvolvida no software possua uma justificativa clara de negócio, conectando problemas reais às soluções entregues pela equipe.

Abaixo apresentamos a matriz de rastreabilidade (Forward Traceability) que mapeia o fluxo: *Problema > Objetivos > Características de Produto > RFs > User Stories (US)*.

## Matriz de Rastreabilidade

<style>
.trace-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.trace-table th, .trace-table td {
  border: 1px solid #e0e0e0;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}
.trace-table th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}
.trace-table tr:hover {
  background-color: #f5f5f5;
}
.cp-cell {
  background-color: #e3f2fd;
  font-weight: 600;
}
.us-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: bold;
}
.us-link:hover {
  text-decoration: underline;
}
</style>

<div style="overflow-x: auto;">
<table class="trace-table">
  <thead>
    <tr>
      <th>Problema Identificado (Cenário)</th>
      <th>Objetivo do Sistema</th>
      <th>Característica do Produto (CP)</th>
      <th>Requisitos Funcionais (RFs)</th>
      <th>User Stories (US - Issues)</th>
    </tr>
  </thead>
  <tbody>
    <!-- P1 -->
    <tr>
      <td rowspan="6"><em>P1.</em> Estudantes e ONGs dependem de processos manuais e informais (WhatsApp, planilhas) para encontrar oportunidades e recrutar voluntários, gerando perda de histórico e fraudes.</td>
      <td rowspan="6">Centralizar a criação de perfis e autenticação segura para estudantes e organizações.</td>
      <td rowspan="6" class="cp-cell"><em>CP01</em> - Gestão de Usuários e Entidades</td>
      <td><em>RF01</em> Cadastrar estudante</td>
      <td><a class="us-link" href="MVP/us1_1.md">#12 (US1.1)</a></td>
    </tr>
    <tr>
      <td><em>RF02</em> Cadastrar org.</td>
      <td><a class="us-link" href="MVP/us1_2.md">#13 (US1.2)</a></td>
    </tr>
    <tr>
      <td><em>RF03</em> Autenticar usuário</td>
      <td><a class="us-link" href="MVP/us1_3.md">#14 (US1.3)</a></td>
    </tr>
    <tr>
      <td><em>RF04</em> Gerenciar perfil est.</td>
      <td><a class="us-link" href="MVP/us1_4.md">#15 (US1.4)</a></td>
    </tr>
    <tr>
      <td><em>RF05</em> Gerenciar perfil org.</td>
      <td><a class="us-link" href="MVP/us1_5.md">#16 (US1.5)</a></td>
    </tr>
    <tr>
      <td><em>RF07</em> Moderar org.</td>
      <td><a class="us-link" href="MVP/us1_7.md">#18 (US1.7)</a></td>
    </tr>

    <!-- P2 -->
    <tr>
      <td rowspan="11"><em>P2.</em> Estudantes perdem muito tempo buscando vagas compatíveis e organizações sofrem para gerenciar múltiplos candidatos em diferentes canais.</td>
      <td rowspan="11">Criar um fluxo automatizado de descoberta de vagas, candidatura e aprovação, conectando ambas as partes.</td>
      <td rowspan="11" class="cp-cell"><em>CP02</em> - Ciclo de Vagas e Engajamento</td>
      <td><em>RF21</em> Criar oportunidade</td>
      <td><a class="us-link" href="MVP/us2_1.md">#19 (US2.1)</a></td>
    </tr>
    <tr>
      <td><em>RF22</em> Editar oportunidade</td>
      <td><a class="us-link" href="MVP/us2_2.md">#50 (US2.2)</a></td>
    </tr>
    <tr>
      <td><em>RF23</em> Publicar oportunidade</td>
      <td><a class="us-link" href="MVP/us2_3.md">#51 (US2.3)</a></td>
    </tr>
    <tr>
      <td><em>RF24</em> Encerrar oportunidade</td>
      <td>#52 (US2.4)</td>
    </tr>
    <tr>
      <td><em>RF08</em> Buscar vaga</td>
      <td><a class="us-link" href="MVP/us2_5.md">#20 (US2.5)</a></td>
    </tr>
    <tr>
      <td><em>RF09</em> Consultar vaga</td>
      <td><a class="us-link" href="MVP/us2_6.md">#21 (US2.6)</a></td>
    </tr>
    <tr>
      <td><em>RF10</em> Realizar candidatura</td>
      <td><a class="us-link" href="MVP/us2_7.md">#22 (US2.7)</a></td>
    </tr>
    <tr>
      <td><em>RF11</em> Avaliar candidatura</td>
      <td><a class="us-link" href="MVP/us2_8.md">#24 (US2.8)</a></td>
    </tr>
    <tr>
      <td><em>RF12</em> Cancelar candidatura</td>
      <td><a class="us-link" href="MVP/us2_9.md">#23 (US2.9)</a></td>
    </tr>
    <tr>
      <td><em>RF13</em> Notificar candidatura</td>
      <td><a class="us-link" href="MVP/us2_10.md">#25 (US2.10)</a></td>
    </tr>
    <tr>
      <td><em>RF25</em> Acompanhar candidaturas</td>
      <td><a class="us-link" href="MVP/us2_11.md">#86 (US2.11)</a></td>
    </tr>

    <!-- P3 -->
    <tr>
      <td rowspan="7"><em>P3.</em> A coordenação de extensão das universidades não consegue auditar ou validar facilmente as horas de voluntariado devido à ausência de comprovantes padronizados.</td>
      <td rowspan="7">Prover o ateste de presença digital e emissão de certificados imutáveis e padronizados que sirvam como comprovação acadêmica.</td>
      <td rowspan="7" class="cp-cell"><em>CP03</em> - Acompanhamento e Certificação Acadêmica</td>
      <td><em>RF14</em> Listar aprovados</td>
      <td><a class="us-link" href="MVP/us3_1.md">#26 (US3.1)</a></td>
    </tr>
    <tr>
      <td><em>RF15</em> Registrar frequência</td>
      <td><a class="us-link" href="MVP/us3_2.md">#27 (US3.2)</a></td>
    </tr>
    <tr>
      <td><em>RF16</em> Emitir certificado</td>
      <td><a class="us-link" href="MVP/us3_3.md">#31 (US3.3)</a></td>
    </tr>
    <tr>
      <td><em>RF17</em> Compartilhar certificado</td>
      <td><a class="us-link" href="MVP/us3_4.md">#32 (US3.4)</a></td>
    </tr>
    <tr>
      <td><em>RF18</em> Consultar histórico</td>
      <td>#33 (US3.5)</td>
    </tr>
    <tr>
      <td><em>RF19</em> Download de certificados</td>
      <td>#34 (US3.6)</td>
    </tr>
    <tr>
      <td><em>RF20</em> Validar certificado</td>
      <td>#30 (US3.7)</td>
    </tr>
  </tbody>
</table>
</div>

## Como interpretar a Rastreabilidade

1.⁠ ⁠*Problema e Objetivos:* Derivados das sessões de elicitação com o cliente e documentados na seção [Cenário Atual](../projeto/cenario.md) e [Solução Proposta](../projeto/solucao.md).
2.⁠ ⁠*Características do Produto (CPs):* Agrupamentos épicos de funcionalidades que encapsulam fluxos completos de valor, documentados nos [Requisitos de Software](../projeto/requisitos_software.md).
3.⁠ ⁠*Requisitos Funcionais (RFs):* As ações técnicas sistêmicas que suportam a característica do produto.
4.⁠ ⁠*User Stories (US):* A unidade atômica de implementação, escrita do ponto de vista do usuário final e rastreada via ID de Issue no quadro Kanban do GitHub, documentadas no [Backlog do Produto](../projeto/backlog_produto.md).
