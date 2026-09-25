import { useState } from "react";

export interface FunctionParameter {
  name: string;
  label: string;
  type: "text" | "number";
  defaultValue: string;
  optional?: boolean;
}

export function FunctionExample({
  params,
  run,
}: {
  params: readonly FunctionParameter[];
  run: (...args: any[]) => unknown;
}) {
  const [values, setValues] = useState<string[]>(() =>
    params.map((param) => param.defaultValue),
  );

  const runtimeArgs = params.map((param, index) => {
    const value = values[index] ?? "";
    if (param.optional && value === "") return undefined;
    return param.type === "number" ? Number(value) : value;
  });

  let output: string;

  try {
    output = JSON.stringify(run(...runtimeArgs), null, 2) ?? "undefined";
  } catch (error) {
    output = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="function-preview">
      <div className="api-parameters">
        {params.map((param, index) => {
          const id = `api-${param.name}`;

          return (
            <div className="api-parameter" key={param.name}>
              <label htmlFor={id}>
                {param.label}
                {param.optional ? " (optional)" : ""}
              </label>
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
            </div>
          );
        })}
      </div>

      <div className="output-label">Live result</div>
      <pre>{output}</pre>
    </div>
  );
}
