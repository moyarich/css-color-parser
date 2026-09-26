import {
  extractCssColors,
  formatCssColor,
} from "@moyarich/css-color-parser";
import { monaco } from "./monaco";

type ProviderGlobal = typeof globalThis & {
  __cssColorParserProvider?: { dispose(): void };
};

export function ensureCssColorProvider() {
  const globalState = globalThis as ProviderGlobal;
  const cssDefaults = monaco.css.cssDefaults;

  if (cssDefaults.modeConfiguration.colors !== false) {
    cssDefaults.setModeConfiguration({
      ...cssDefaults.modeConfiguration,
      colors: false,
    });
  }

  if (globalState.__cssColorParserProvider) return;

  globalState.__cssColorParserProvider = monaco.languages.registerColorProvider(
    "css",
    {
      provideDocumentColors(model) {
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

      provideColorPresentations(_model, colorInfo) {
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
    },
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    const globalState = globalThis as ProviderGlobal;
    globalState.__cssColorParserProvider?.dispose();
    delete globalState.__cssColorParserProvider;
  });
}
