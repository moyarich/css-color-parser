import { useState, type ComponentType } from "react";

export interface PlaygroundEntry {
  id: string;
  label: string;
  group: string;
  Component: ComponentType;
}

function GitHubIcon() {
  return (
    <svg className="github-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.2c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.95 10.95 0 0 1 5.75 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.24c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
      />
    </svg>
  );
}

export function PlaygroundPage({ examples }: { examples: readonly PlaygroundEntry[] }) {
  const [selectedId, setSelectedId] = useState(examples[0]?.id ?? "");
  const selected = examples.find((example) => example.id === selectedId) ?? examples[0];

  if (!selected) return null;

  const SelectedPage = selected.Component;
  const groups = [...new Set(examples.map((example) => example.group))];

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="hero-bar">
          <p className="eyebrow">@moyarich/css-color-parser</p>
          <a
            className="github-link"
            href="https://github.com/moyarich/css-color-parser"
            target="_blank"
            rel="noreferrer"
            aria-label="View css-color-parser on GitHub"
          >
            <GitHubIcon />
            <span>GitHub</span>
          </a>
        </div>
        <h1>CSS color parser playground</h1>
        <p>Explore the live editor integration and every exported package function from one playground.</p>
      </header>

      <section className="playground-shell">
        <aside className="example-sidebar" aria-label="Playground examples">
          {groups.map((group) => (
            <div className="example-group" key={group}>
              <div className="sidebar-heading">{group}</div>
              <nav className="example-list">
                {examples
                  .filter((example) => example.group === group)
                  .map((example) => (
                    <button
                      key={example.id}
                      type="button"
                      aria-pressed={example.id === selected.id}
                      onClick={() => setSelectedId(example.id)}
                    >
                      {example.label}
                    </button>
                  ))}
              </nav>
            </div>
          ))}
        </aside>

        <div className="playground-main">
          <SelectedPage key={selected.id} />
        </div>
      </section>
    </main>
  );
}
