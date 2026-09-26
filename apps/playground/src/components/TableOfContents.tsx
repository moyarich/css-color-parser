import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  label: string;
  level: 2 | 3;
}

export function TableOfContents({
  rootId,
  pageKey,
}: {
  rootId: string;
  pageKey: string;
}) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const root = document.getElementById(rootId);

    if (!root) {
      setItems([]);
      return;
    }

    const nextItems = Array.from(
      root.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"),
    ).map((heading) => ({
      id: heading.id,
      label: heading.textContent?.trim() ?? heading.id,
      level: Number(heading.tagName.slice(1)) as 2 | 3,
    }));

    setItems(nextItems);
  }, [rootId, pageKey]);

  if (items.length === 0) return null;

  return (
    <details className="page-toc" open>
      <summary>On this page</summary>
      <nav aria-label="Table of contents">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            data-level={item.level}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </details>
  );
}
