import { useId, useState } from "react";

export interface FunctionParameter {
  name: string;
  label: string;
  type: "text" | "number";
  defaultValue: string;
  optional?: boolean;
  multiline?: boolean;
}

export function FunctionExample({
  params,
  run,
  samples = [],
}: {
  params: readonly FunctionParameter[];
  run: (...args: any[]) => unknown;
  samples?: readonly { label: string; values: readonly string[] }[];
}) {
  const inputId = useId();
  const [values, setValues] = useState<string[]>(() =>
    params.map((param) => param.defaultValue),
  );

  const runtimeArgs = params.map((param, index) => {
    const value = values[index] ?? "";
    if (param.optional && value === "") return undefined;
    return param.type === "number" ? Number(value) : value;
  });

  let output: string;
  let failed = false;

  try {
    output = JSON.stringify(run(...runtimeArgs), null, 2) ?? "undefined";
  } catch (error) {
    failed = true;
    output = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="function-preview">
      <div className="sample-toolbar">
        <span>Try an input</span>
        {samples.map((sample) => (
          <button
            type="button"
            key={sample.label}
            onClick={() => setValues([...sample.values])}
          >
            {sample.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setValues(params.map((param) => param.defaultValue))}
        >
          Reset
        </button>
      </div>
      <div className="api-parameters">
        {params.map((param, index) => {
          const id = `${inputId}-${param.name}`;

          return (
            <div className="api-parameter" key={param.name}>
              <label htmlFor={id}>
                {param.label}
                {param.optional ? " (optional)" : ""}
              </label>
              {param.multiline ? (
                <textarea
                  id={id}
                  value={values[index] ?? ""}
                  rows={5}
                  spellCheck={false}
                  onChange={(event) =>
                    setValues(
                      values.map((value, i) =>
                        i === index ? event.target.value : value,
                      ),
                    )
                  }
                />
              ) : (
                <input
                  id={id}
                  type={param.type}
                  value={values[index] ?? ""}
                  onChange={(event) => {
                    const next = [...values];
                    next[index] = event.target.value;
                    setValues(next);
                  }}
                  spellCheck={false}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="output-label">
        {failed ? "Input error" : "Live result"}
      </div>
      <pre className={failed ? "result-error" : undefined} aria-live="polite">
        {output}
      </pre>
      {output === "null" && (
        <p className="result-hint">
          No color could be parsed. Try a complete, supported CSS color value.
        </p>
      )}
      {output === "[]" && (
        <p className="result-hint">
          No resolvable colors found in this source.
        </p>
      )}
    </div>
  );
}
