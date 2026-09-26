import {
  extractCssColors,
  formatCssColor,
} from "@moyarich/css-color-parser";
import type { Monaco } from "@monaco-editor/react";
import type { editor, languages } from "monaco-editor";

const providers = new WeakMap<object, { dispose(): void }>();

export function ensureCssColorProvider(monaco: Monaco) {
  const existing = providers.get(monaco);
  if (existing) return existing;

  const cssDefaults = monaco.css.cssDefaults;

  if (cssDefaults.modeConfiguration.colors !== false) {
    cssDefaults.setModeConfiguration({
      ...cssDefaults.modeConfiguration,
      colors: false,
    });
  }

  const provider = monaco.languages.registerColorProvider("css", {
    provideDocumentColors(model: editor.ITextModel) {
      return extractCssColors(model.getValue()).map((match) => {
        const start = model.getPositionAt(match.start);
        const end = model.getPositionAt(match.end);

        return {
          range: new monaco.Range(
            start.lineNumber,
            start.column,
            end.lineNumber,
            end.column,
          ),
          color: {
            red: match.color.red / 255,
            green: match.color.green / 255,
            blue: match.color.blue / 255,
            alpha: match.color.alpha,
          },
        };
      });
    },

    provideColorPresentations(
      _model: editor.ITextModel,
      colorInfo: languages.IColorInformation,
    ) {
      const { red, green, blue, alpha } = colorInfo.color;

      return [
        {
          label: formatCssColor({
            red: red * 255,
            green: green * 255,
            blue: blue * 255,
            alpha,
          }),
        },
      ];
    },
  });

  providers.set(monaco, provider);
  return provider;
}
