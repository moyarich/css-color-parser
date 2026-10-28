import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import CssWorker from "monaco-editor/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/language/html/html.worker?worker";
import JsonWorker from "monaco-editor/language/json/json.worker?worker";
import TypeScriptWorker from "monaco-editor/language/typescript/ts.worker?worker";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";

(
  globalThis as typeof globalThis & { MonacoEnvironment: unknown }
).MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    switch (label) {
      case "css":
      case "scss":
      case "less":
        return new CssWorker();
      case "html":
      case "handlebars":
      case "razor":
        return new HtmlWorker();
      case "json":
        return new JsonWorker();
      case "javascript":
      case "typescript":
        return new TypeScriptWorker();
      default:
        return new EditorWorker();
    }
  },
};

loader.config({ monaco });

export { monaco };
