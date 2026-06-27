# Criar Vaga Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir a tela de Criação de Vagas para ficar 1:1 com o protótipo do Figma (Node ID "486:6"), descartando o uso de NativeWind/Tailwind e aplicando React Native StyleSheet com a identidade visual estabelecida no app.

**Architecture:** A tela usa React Native tradicional com `ScrollView` e renderização condicional baseada no estado `step` (1 a 3). O gerenciamento de estado existente será mantido, mas o JSX será totalmente reescrito.

**Tech Stack:** React Native (StyleSheet, View, Text, TextInput, TouchableOpacity), Expo ImagePicker.

## Global Constraints

- **Proibido o uso de classes Tailwind/NativeWind.**
- Usar cores padrão: Fundo (`#faf8f4`), Navbar/Header (`#1a2744`), Destaque/Botões Primários (`#d4813a`), Textos Secundários (`#7a8299`), Bordas (`#ddd8ce`).
- Nomes das propriedades de estado originais e função `handleSubmit` e `pickImage` não devem ser alteradas (integração já funcional).

---

### Task 1: Estruturar Componente e Estilos Básicos

**Files:**
- Modify: `frontend/src/screens/organization/CreateOpportunityScreen.tsx`

**Interfaces:**
- Consumes: `useAuth`, `createOpportunity`, state original.
- Produces: Tela principal com o header e a casca do formulário em StyleSheet.

- [ ] **Step 1: Substituir importações e atualizar dependências visuais**
  Substituir o `Button` nativo por `TouchableOpacity` com ícones (Ionicons).
  Remover qualquer `className="..."` no wrapper principal e adicionar `style={styles.container}`.

- [ ] **Step 2: Criar o cabeçalho estilo Figma**
  Construir um cabeçalho fixo no topo com fundo `#1a2744`, ícone de voltar, título "Criar nova vaga" em branco.

- [ ] **Step 3: Criar o StyleSheet base**
  ```typescript
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf8f4' },
    header: { backgroundColor: '#1a2744', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    // Outros estilos bases para inputs, labels e botões.
  });
  ```

---

### Task 2: Implementar Componentes de Formulário (Passo 1 e 2)

**Files:**
- Modify: `frontend/src/screens/organization/CreateOpportunityScreen.tsx`

- [ ] **Step 1: Estilizar inputs e labels (Passo 1 - Informações Básicas)**
  Adicionar estilos para labels (`fontSize: 14`, `fontWeight: 'bold'`, `color: '#1a2744'`, `marginBottom: 8`).
  Adicionar estilo de TextInput: borda `#ddd8ce`, borderRadius `10`, fundo branco, altura `48` (ou minHeight `100` para multiline).
  Mapear "Título", "Categoria" (substituindo área provisória), "Descrição", e os novos campos (`vacancies`, `workload_value`).

- [ ] **Step 2: Implementar Passo 2 (Local e Modalidade)**
  Aplicar os mesmos estilos de input.
  Incluir campos: `modality` (Presencial, Remoto, Híbrido), `location`, `start_date`, `start_time`.

- [ ] **Step 3: Criar Botões de Navegação Padronizados**
  Criar botões de avanço ("Próximo") e recuo ("Voltar") com os estilos visuais de `HomeScreen` (botão sólido laranja `#d4813a` para avançar, botão com bordas vazadas `#1a2744` para recuo).

---

### Task 3: Implementar Requisitos e Upload de Fotos (Passo 3)

**Files:**
- Modify: `frontend/src/screens/organization/CreateOpportunityScreen.tsx`

- [ ] **Step 1: Melhorar a UI da Lista de Requisitos**
  Transformar o map dos `requirements` num container com fundo branco e ícone de "X" vermelho (lixeira) para remover. Adicionar botão secundário "Adicionar Requisito" com ícone de `+`.

- [ ] **Step 2: Melhorar a UI do Upload de Fotos**
  Criar um card vazado de borda tracejada (`borderStyle: 'dashed'`) que atua como o botão de `pickImage`.
  Exibir miniaturas das imagens lado a lado num `ScrollView` horizontal com opção de excluir a miniatura.

- [ ] **Step 3: Botões Finais de Ação**
  Criar os botões "Salvar Rascunho" (outline preto/azul escuro) e "Publicar Agora" (fundo laranja `#d4813a`).

- [ ] **Step 4: Limpar código legado**
  Garantir que não sobre nenhum `className` do Tailwind no arquivo inteiro e validar todo o encadeamento de passos e navegação.
