# Development

Development guide for `@moyarich/css-color-parser`.

## Repository structure

This repository is an npm monorepo. The root coordinates the workspaces, the publishable parser lives under `packages/*`, and browser-facing development tools live under `apps/*`.

```text
packages/css-color-parser/      publishable parser package
├── src/                        package source
├── tests/                      parser tests
├── package.json                package metadata and public entry point
└── tsconfig.json               package TypeScript configuration

apps/playground/                Vite playground for the public package API
package.json                    monorepo workspace scripts
README.md                       canonical package README
docs/readme-dev.md              development documentation
```

## README source of truth

The root `README.md` is the canonical package README. Do not maintain a separate package README by hand.

The `@moyarich/css-color-parser` workspace `prepack` step copies the root README into `packages/css-color-parser/README.md` immediately before packing or publishing so the package receives the same documentation.

## Install dependencies

Install all workspace dependencies from the repository root:

```bash
npm install
```

## Development checks

Run the same workspace checks used by CI:

```bash
npm run check
```

The root commands delegate to the parser workspace where appropriate:

```bash
npm run typecheck
npm test
npm run test:watch
npm run build
npm run build:playground
npm run check
```

`npm test`, `npm run typecheck`, and `npm run build` target the `@moyarich/css-color-parser` workspace. `npm run check` runs every workspace that provides a `check` script.

## Playground

The interactive playground lives at `apps/playground/` and consumes the parser through its public package API.

Start it from the repository root:

```bash
npm run dev:playground
```

Build it with:

```bash
npm run build:playground
```

## Package

The publishable package is `packages/css-color-parser/`. Its build produces ESM, CommonJS, and TypeScript declarations in `dist/`.

Before packaging, `prepack` copies the canonical root README into the package directory and builds the package.
