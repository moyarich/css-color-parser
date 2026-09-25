import { useEffect, useRef, useState } from "react";
import { monaco } from "../lib/monaco";

export function CodeExample({ value, ariaLabel }: { value: string; ariaLabel: string }) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!host.current) return;

    const instance = monaco.editor.create(host.current, {
      value,
      language: "typescript",
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
    const model = editor.current?.getModel();
    if (model && model.getValue() !== value) model.setValue(value);
  }, [value]);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const height = Math.max(88, value.split("\n").length * 20 + 28);

  return (
    <div className="code-example">
      <button className="copy-button" type="button" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <div ref={host} className="code-editor" style={{ height }} aria-label={ariaLabel} />
    </div>
  );
}
