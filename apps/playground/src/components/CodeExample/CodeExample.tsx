import { useMemo, useState } from "react";
import {
  CssColorEditor,
  type CssColorEditorFile,
} from "@moyarich/css-color-parser-monaco";

export type CodeExampleFile = CssColorEditorFile;

export function CodeExample({
  value,
  files,
  ariaLabel,
}: {
  value?: string;
  files?: readonly CodeExampleFile[];
  ariaLabel: string;
}) {
  const sourceFiles = useMemo<readonly CodeExampleFile[]>(
    () =>
      files?.length
        ? files
        : [{ name: "example.tsx", value: value ?? "", language: "typescript" }],
    [files, value],
  );
  const [activeName, setActiveName] = useState(sourceFiles[0]?.name ?? "");
  const [copied, setCopied] = useState(false);

  const activeFile =
    sourceFiles.find((file) => file.name === activeName) ?? sourceFiles[0];

  const copy = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="code-example">
      <button className="copy-button" type="button" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>

      <CssColorEditor
        files={sourceFiles}
        activeFile={activeName}
        onActiveFileChange={(name) => setActiveName(name)}
        beforeMount={() => undefined}
        height={Math.max(
          88,
          (activeFile?.value.split("\n").length ?? 3) * 20 + 28,
        )}
        theme="vs"
        options={{
          readOnly: true,
          domReadOnly: true,
          automaticLayout: true,
          minimap: { enabled: false },
          lineNumbers: "on",
          folding: false,
          glyphMargin: false,
          overviewRulerLanes: 0,
          renderLineHighlight: "none",
          scrollBeyondLastLine: false,
          scrollbar: {
            vertical: "hidden",
            horizontal: "auto",
            alwaysConsumeMouseWheel: false,
          },
          wordWrap: "on",
          padding: { top: 14, bottom: 14 },
          fontSize: 13,
          lineHeight: 20,
        }}
      />
    </div>
  );
}
