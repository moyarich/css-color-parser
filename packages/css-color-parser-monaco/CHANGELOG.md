# Changelog

## Unreleased

No package-specific changes since November 25, 2026.

## 0.1.0

Initial release. Includes changes through November 24, 2026, based on commit [`b70bb77`](https://github.com/moyarich/css-color-parser/commit/b70bb77df5007b75cff04b3a475564c2a006d6e9).

### Added

- Reusable `CssColorEditor` React component wrapping `@monaco-editor/react`, forwarding standard editor props and enabling parser-backed CSS color support.
- Standalone `ensureCssColorProvider(monaco)` for applications that manage their own editor lifecycle, with idempotent registration per Monaco instance.
- Color decorations for supported classic and modern CSS expressions, using the core parser's exact source ranges.
- Color presentations that serialize edited colors through the core parser, replacing the built-in CSS color provider.
- Optional multi-file editing with file tabs, language and path metadata, controlled or uncontrolled active file selection, and change callbacks.
- Public TypeScript types for editor props, file metadata, and Monaco lifecycle callbacks.

### Packaging

- Independent ESM and CommonJS builds with TypeScript declarations.
- React, Monaco and the React editor wrapper remain peer dependencies; CSS parsing and serialization are delegated to `@moyarich/css-color-parser`.
- GitHub Packages publishing configuration and documented host-owned worker setup.

### Usage

```tsx
import { CssColorEditor } from "@moyarich/css-color-parser-monaco";

export function ColorEditor() {
  return (
    <CssColorEditor
      height="320px"
      defaultLanguage="css"
      defaultValue="a { color: rebeccapurple; }"
    />
  );
}
```
