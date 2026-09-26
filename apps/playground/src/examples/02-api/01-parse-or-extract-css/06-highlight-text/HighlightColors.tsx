import { useMemo, useState } from "react";
import { extractCssColors } from "@moyarich/css-color-parser";

const initialText = `The brand color is #635bff.
Use rebeccapurple for headings and rgb(220 38 38) for errors.
A softer accent can be oklch(72% 0.16 210).`;

export default function HighlightColors() {
  const [text, setText] = useState(initialText);
  const matches = useMemo(() => extractCssColors(text), [text]);

  const parts = useMemo(() => {
    const result: Array<{ text: string; color?: string }> = [];
    let cursor = 0;

    for (const match of matches) {
      if (match.start > cursor) {
        result.push({ text: text.slice(cursor, match.start) });
      }

      result.push({
        text: text.slice(match.start, match.end),
        color: `rgba(${Math.round(match.color.red)}, ${Math.round(match.color.green)}, ${Math.round(match.color.blue)}, ${match.color.alpha})`,
      });

      cursor = match.end;
    }

    if (cursor < text.length) {
      result.push({ text: text.slice(cursor) });
    }

    return result;
  }, [matches, text]);

  return (
    <div className="usage-example">
      <label htmlFor="arbitrary-text-source">Arbitrary text</label>
      <textarea
        id="arbitrary-text-source"
        className="usage-textarea"
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
      />

      <div className="highlight-output" aria-label="Highlighted color occurrences">
        {parts.map((part, index) =>
          part.color ? (
            <mark
              className="color-highlight"
              key={index}
              style={{ boxShadow: `inset 0 -3px 0 ${part.color}` }}
            >
              {part.text}
            </mark>
          ) : (
            <span key={index}>{part.text}</span>
          ),
        )}
      </div>
    </div>
  );
}
