import { useEffect, useMemo, useRef, useState } from "react";
import { monaco } from "../lib/monaco";

export interface CodeExampleFile {
  name: string;
  value: string;
  language?: string;
}

function languageFromName(name: string) {
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".md") || name.endsWith(".mdx")) return "markdown";
  if (name.endsWith(".js") || name.endsWith(".jsx")) return "javascript";
  return "typescript";
}

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
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);

  const activeFile =
    sourceFiles.find((file) => file.name === activeName) ?? sourceFiles[0];

  useEffect(() => {
    if (!sourceFiles.some((file) => file.name === activeName)) {
      setActiveName(sourceFiles[0]?.name ?? "");
    }
  }, [activeName, sourceFiles]);

  useEffect(() => {
    if (!host.current || !activeFile) return;

    const instance = monaco.editor.create(host.current, {
      value: activeFile.value,
      language: activeFile.language ?? languageFromName(activeFile.name),
      theme: "vs",
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
    });

    editor.current = instance;
    return () => instance.dispose();
  }, []);

  useEffect(() => {
    if (!activeFile) return;

    const model = editor.current?.getModel();
    if (!model) return;

    const language = activeFile.language ?? languageFromName(activeFile.name);
    monaco.editor.setModelLanguage(model, language);

    if (model.getValue() !== activeFile.value) {
      model.setValue(activeFile.value);
    }
  }, [activeFile]);

  if (!activeFile) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(activeFile.value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const height = Math.max(88, activeFile.value.split("\n").length * 20 + 28);

  return (
    <div className="code-example">
      {sourceFiles.length > 1 && (
        <div className="code-file-tabs" role="tablist" aria-label="Example files">
          {sourceFiles.map((file) => (
            <button
              key={file.name}
              className="code-file-tab"
              type="button"
              role="tab"
              aria-selected={file.name === activeFile.name}
              onClick={() => setActiveName(file.name)}
            >
              {file.name}
            </button>
          ))}
        </div>
      )}

      <button className="copy-button" type="button" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>

      <div
        ref={host}
        className="code-editor"
        style={{ height }}
        aria-label={`${ariaLabel}: ${activeFile.name}`}
      />
    </div>
  );
}
