# SimpleScale

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development the renderer side

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production the renderer side

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Run as dev the electron app

```sh
npm run dev
```

```sh
npm run electron:dev
```

### Run as prev the electron app(should be built the renderer side)

```sh
npm run electron:prev
```

### Build the electron app

```sh
npm run electron:build
```

### Package the electron app

```sh
npm run electron:package
```

### Make distributable(see platforms setting forge.config.ts)

```sh
npm run electron:make
```

### Debugging COM Port using socat

1. To open duplex virtual ports

```bash
socat -d -d pty,raw,echo=0 pty,raw,echo=0
```

The response should be like:

```bash
2025/10/02 14:03:22 socat[131541] N PTY is /dev/pts/5
2025/10/02 14:03:22 socat[131541] N PTY is /dev/pts/6
2025/10/02 14:03:22 socat[131541] N starting data transfer loop with FDs [5,5] and [7,7]
```

2. To send data to com port use:

```bash
echo "some text" > /dev/pts/6
```

3. (OPTIONAL)In another terminal you should run command for getting data:

```bash
cat < /dev/pts/6
```
