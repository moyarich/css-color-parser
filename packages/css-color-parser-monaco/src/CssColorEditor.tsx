import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Editor, {
  type EditorProps,
  type Monaco,
} from "@monaco-editor/react";
import { ensureCssColorProvider } from "./cssColorProvider";

export interface CssColorEditorFile {
  name: string;
  value: string;
  language?: string;
  path?: string;
}

export type CssColorEditorProps = EditorProps & {
  /**
   * Optional multi-file mode. When supplied, the active file controls
   * value, path, and language while every other @monaco-editor/react prop
   * is forwarded unchanged.
   */
  files?: readonly CssColorEditorFile[];
  activeFile?: string;
  defaultActiveFile?: string;
  onActiveFileChange?: (
    name: string,
    file: CssColorEditorFile,
  ) => void;
  showFileTabs?: boolean;
};

function languageFromName(name: string) {
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".scss")) return "scss";
  if (name.endsWith(".less")) return "less";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".md") || name.endsWith(".mdx")) return "markdown";
  if (name.endsWith(".js") || name.endsWith(".jsx")) return "javascript";
  return "typescript";
}

export function CssColorEditor({
  files,
  activeFile: controlledActiveFile,
  defaultActiveFile,
  onActiveFileChange,
  showFileTabs = true,
  beforeMount,
  onMount,
  onChange,
  options,
  value,
  defaultValue,
  language,
  defaultLanguage,
  path,
  ...editorProps
}: CssColorEditorProps) {
  const [uncontrolledActiveFile, setUncontrolledActiveFile] = useState(
    defaultActiveFile ?? files?.[0]?.name ?? "",
  );
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries((files ?? []).map((file) => [file.name, file.value])),
  );

  useEffect(() => {
    if (!files) return;

    setDrafts((current) => {
      const next = { ...current };

      for (const file of files) {
        if (!(file.name in next)) next[file.name] = file.value;
      }

      return next;
    });
  }, [files]);

  const selectedName =
    controlledActiveFile ?? uncontrolledActiveFile ?? files?.[0]?.name ?? "";

  const selectedFile = useMemo(
    () =>
      files?.find((file) => file.name === selectedName) ??
      files?.[0],
    [files, selectedName],
  );

  useEffect(() => {
    if (!files?.length) return;
    if (files.some((file) => file.name === selectedName)) return;

    const first = files[0];
    setUncontrolledActiveFile(first.name);
    onActiveFileChange?.(first.name, first);
  }, [files, onActiveFileChange, selectedName]);

  const selectFile = (file: CssColorEditorFile) => {
    if (controlledActiveFile === undefined) {
      setUncontrolledActiveFile(file.name);
    }

    onActiveFileChange?.(file.name, file);
  };

  const effectiveLanguage =
    selectedFile?.language ??
    (selectedFile ? languageFromName(selectedFile.name) : language);

  const effectiveValue = selectedFile
    ? (drafts[selectedFile.name] ?? selectedFile.value)
    : value;

  const effectivePath = selectedFile
    ? (selectedFile.path ?? selectedFile.name)
    : path;

  const handleBeforeMount = (monaco: Monaco) => {
    ensureCssColorProvider(monaco);
    beforeMount?.(monaco);
  };

  const mergedOptions = {
    ...options,
    colorDecorators:
      effectiveLanguage === "css"
        ? (options?.colorDecorators ?? true)
        : options?.colorDecorators,
  };

  return (
    <div className="css-color-editor">
      {files &&
        files.length > 1 &&
        showFileTabs && (
          <div
            className="css-color-editor__tabs"
            role="tablist"
            aria-label="Files"
          >
            {files.map((file) => (
              <button
                key={file.name}
                className="css-color-editor__tab"
                type="button"
                role="tab"
                aria-selected={file.name === selectedFile?.name}
                onClick={() => selectFile(file)}
              >
                {file.name}
              </button>
            ))}
          </div>
        )}

      <Editor
        {...editorProps}
        path={effectivePath}
        value={effectiveValue}
        defaultValue={selectedFile ? undefined : defaultValue}
        language={effectiveLanguage}
        defaultLanguage={selectedFile ? undefined : defaultLanguage}
        options={mergedOptions}
        beforeMount={handleBeforeMount}
        onMount={onMount}
        onChange={(nextValue, event) => {
          if (selectedFile) {
            setDrafts((current) => ({
              ...current,
              [selectedFile.name]: nextValue ?? "",
            }));
          }

          onChange?.(nextValue, event);
        }}
      />
    </div>
  );
}
