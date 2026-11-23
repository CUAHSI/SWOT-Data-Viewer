# SWOT-DATA-VIEWER

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm test
```

Runs once, headless, in jsdom. Unit tests live next to the code they test, in `src/**/__tests__/*.test.js`, and use the Vite config in `vite.config.mjs` (see its `test` block). jsdom does no layout, so test layout in the browser tests below.

### Run Browser Tests with [Playwright](https://playwright.dev/)

Install the Chromium build Playwright uses (once, and after upgrading `@playwright/test`):

```sh
npx playwright install chromium
```

Then:

```sh
npm run test:e2e
```

Browser tests live in `e2e/` and run headless in Chromium against the Vite dev server, which Playwright starts on port 5174 (see `playwright.config.js`). They intercept every request to another host, replacing images with a placeholder and blocking the rest, so they don't depend on external sites. Useful options:

```sh
npm run test:e2e -- --headed              # watch the browser
npm run test:e2e -- -g "360px"             # run tests whose title matches
npx playwright show-trace test-results/<test>/trace.zip   # inspect a failure
```

Both commands exit non-zero when a test fails.

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
