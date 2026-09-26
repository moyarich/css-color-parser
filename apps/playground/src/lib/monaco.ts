import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import CssWorker from "monaco-editor/language/css/css.worker?worker";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";

(globalThis as typeof globalThis & { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    return label === "css" || label === "scss" || label === "less"
      ? new CssWorker()
      : new EditorWorker();
  },
};

loader.config({ monaco });

export { monaco };
