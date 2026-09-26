# @moyarich/css-color-parser-monaco

Reusable React/Monaco integration for
[`@moyarich/css-color-parser`](https://github.com/moyarich/css-color-parser).

It adds CSS color parsing, Monaco color decorations, color presentations, and an
optional multi-file React editor wrapper without moving editor-specific code into
the core parser package.

## Install

This package is published through GitHub Packages.

Add the `@moyarich` registry mapping to your project or user `.npmrc`:

```ini
@moyarich:registry=https://npm.pkg.github.com
```

Keep authentication in your user-level npm configuration or environment; do not
commit a GitHub token to the repository.

Install the package and its peer dependencies:

```bash
npm install @moyarich/css-color-parser-monaco@latest \
  @moyarich/css-color-parser@latest \
  @monaco-editor/react monaco-editor react
```

## Quick start

```tsx
import { CssColorEditor } from "@moyarich/css-color-parser-monaco";

export function ColorEditor() {
  return (
    <CssColorEditor
      height="320px"
      defaultLanguage="css"
      defaultValue={`
:root {
  --brand: oklch(60% 0.15 250);
}

.button {
  color: rebeccapurple;
  background: color-mix(in srgb, #06c, white);
}
`}
    />
  );
}
```

`CssColorEditor` accepts the normal
[`@monaco-editor/react` Editor props](https://github.com/suren-atoyan/monaco-react)
and forwards them to the underlying editor.

## Multi-file mode

Pass `files` to enable the package's optional file switching layer:

```tsx
import { CssColorEditor } from "@moyarich/css-color-parser-monaco";

const files = [
  {
    name: "theme.css",
    language: "css",
    value: `
:root {
  --brand: #663399;
}

.card {
  color: var(--brand);
}
`,
  },
  {
    name: "example.tsx",
    language: "typescript",
    value: `
export function Card() {
  return <div className="card">Hello</div>;
}
`,
  },
];

export function Example() {
  return (
    <CssColorEditor
      files={files}
      height="360px"
      options={{ automaticLayout: true }}
    />
  );
}
```

Each file supports:

```ts
interface CssColorEditorFile {
  name: string;
  value: string;
  language?: string;
  path?: string;
}
```

Additional multi-file props:

```ts
interface CssColorEditorProps {
  files?: readonly CssColorEditorFile[];
  activeFile?: string;
  defaultActiveFile?: string;
  onActiveFileChange?: (
    name: string,
    file: CssColorEditorFile,
  ) => void;
  showFileTabs?: boolean;
}
```

These are added on top of the full `EditorProps` surface from
`@monaco-editor/react`.

## Color provider only

If you already own the Monaco editor lifecycle, register only the color provider:

```tsx
import Editor from "@monaco-editor/react";
import {
  ensureCssColorProvider,
} from "@moyarich/css-color-parser-monaco";

export function ExistingEditor() {
  return (
    <Editor
      defaultLanguage="css"
      beforeMount={(monaco) => {
        ensureCssColorProvider(monaco);
      }}
    />
  );
}
```

`ensureCssColorProvider()` is idempotent for each Monaco instance.

The provider:

- reads CSS colors with `extractCssColors()`
- converts parsed colors to Monaco color decorations
- serializes Monaco color edits with `formatCssColor()`
- disables Monaco's built-in CSS color provider before registering the parser-backed provider

## Monaco setup

The package intentionally does not own bundler-specific Monaco worker setup.

For Vite, configure Monaco and its workers in the application:

```ts
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import CssWorker from "monaco-editor/language/css/css.worker?worker";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";

globalThis.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    return label === "css" || label === "scss" || label === "less"
      ? new CssWorker()
      : new EditorWorker();
  },
};

loader.config({ monaco });
```

This keeps the package reusable across Vite, Next.js, custom Webpack setups, and
other Monaco hosts.

## Public API

### `CssColorEditor`

React wrapper around `@monaco-editor/react` with automatic parser-backed CSS
color support and optional multi-file state.

### `ensureCssColorProvider(monaco)`

Registers the parser-backed Monaco CSS color provider once for a Monaco instance.

### Types

The package exports:

- `CssColorEditorFile`
- `CssColorEditorProps`
- `BeforeMount`
- `EditorProps`
- `Monaco`
- `OnChange`
- `OnMount`

## Package boundaries

```text
@moyarich/css-color-parser
  color parsing / extraction / serialization

@moyarich/css-color-parser-monaco
  Monaco + React integration
```

CSS custom-property resolution used by the core parser is shared with
`@moyarich/css-expand-collapse`; this package does not implement a separate CSS
variable resolver.

## Development

From the monorepo root:

```bash
npm install
npm run build --workspace @moyarich/css-color-parser-monaco
npm run typecheck --workspace @moyarich/css-color-parser-monaco
```

## License

MIT
