# Fix: `actImplementation is not a function` (Jest + Expo 54 / React 19)

> **RESOLVIDO.** Root cause e correção aplicada abaixo. O texto antigo (toolchain /
> shim) estava no caminho certo mas errava a causa — registrado no fim como histórico.

## Sintoma

Toda suíte com `@testing-library/react-native` falhava no load:

```
TypeError: actImplementation is not a function
  at node_modules/@testing-library/react-native/src/act.ts:30
```

## Causa raiz (confirmada)

O shell deste ambiente exporta **`NODE_ENV=production`** globalmente e isso vazava
pro Jest. Dois efeitos, ambos do mesmo `NODE_ENV`:

1. **`React.act` some.** `react/index.js` faz `require` da build conforme
   `process.env.NODE_ENV`. Em `production` carrega `cjs/react.production.js`, que
   **não exporta `act`** (só a dev build tem). `react` não passa pelo transform do
   Jest, então lê o env em runtime → `React.act === undefined` → RTL 13 quebra com
   `actImplementation is not a function`.
2. **`Animated` quebra.** `react-native` **passa** pelo transform, e o
   `babel-preset-expo` faz *inline* de `process.env.NODE_ENV` em tempo de transform,
   gravando o literal `"production"` no código transpilado. Em
   `AnimatedProps.js` o guard `process.env.NODE_ENV === 'test'` (que evita o crash
   no test renderer) vira `"production" === 'test'` → `false` → lança
   `Unable to locate attached view in the native tree` em todo `fireEvent.press`
   sobre `TouchableOpacity` (animação de opacity).

Probe que fechou o diagnóstico (dentro do Jest):
```
NODE_ENV= production | React.act: undefined | react-test-renderer.act: undefined
```
Forçando `NODE_ENV=test`: `React.act: function` e o guard do Animated volta a valer.

> O toolchain de teste (`jest-expo@54`, `react-test-renderer@19.1.0`,
> `@testing-library/react-native@13.3.3`) já estava alinhado ao SDK 54
> (`npx expo install --check` só apontava `react-native-svg`). Não era versão.

## Correção aplicada

1. **`package.json > scripts.test`** força o env do processo (resolve os dois
   efeitos de uma vez — build do `react` e inline do babel):
   ```diff
   - "test": "jest --watchAll=false",
   + "test": "NODE_ENV=test jest --watchAll=false",
   ```
   > Não dá pra resolver só no `setupFiles`: o babel grava o literal em
   > transform-time, antes de qualquer código de runtime rodar.
2. **Removido o shim** `frontend/jest.setup.act.js` e a entrada `jest.setupFiles`
   que o referenciava — desnecessário com o `React.act` real.
3. **Removido `@testing-library/jest-native`** (deprecado) e o
   `setupFilesAfterEnv` com `extend-expect`. Os matchers já vêm no RTL ≥ 12.4.

⚠️ **`npm install` / `npm rm` neste shell prunam devDependencies** (por causa do
`NODE_ENV=production`). Se o `jest` "sumir", reinstale com
`NODE_ENV=development npm install --include=dev`.

## Resultado

`npm test`: **500 passam / 13 falham**, zero `actImplementation is not a function`
e zero `Unable to locate attached view`. As 13 falhas restantes (4 suites:
`OpportunityCard`, `StudentTabNavigator`, `OrgProfileScreen`, `OrgProfileEditScreen`)
são bugs de teste **não relacionados**, que o act quebrado mascarava — ex.:
`OpportunityCard.test` espera `[icon:bookmark]` mas o componente renderiza `heart`
(asserts desatualizados); telas de perfil não dão `waitFor` em dados async.
Corrigir separado do fix de act.

## Notas

- Nada afeta build de produção (`eas build` / `expo export`) — só ambiente de teste.
- `NODE_ENV=test` inline no script não é cross-platform (Windows cmd). Se a equipe
  rodar no Windows, trocar por `cross-env NODE_ENV=test ...`. Hoje todos em
  Linux/macOS, então sem a dependência extra.
