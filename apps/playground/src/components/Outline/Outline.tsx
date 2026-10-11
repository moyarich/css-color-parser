import "./Outline.css";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Toc } from "@stefanprobst/rehype-extract-toc";

export function Outline({ headings }: { headings: Toc }) {
  const { pathname, search } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const [activeId, setActiveId] = useState("");
  const items = useMemo(() => {
    const flatten = (entries: Toc): Toc =>
      entries.flatMap((entry) => [entry, ...flatten(entry.children ?? [])]);
    return flatten(headings).filter(
      (item) => item.id && item.depth >= 2 && item.depth <= 3,
    );
  }, [headings]);

  useEffect(() => {
    const id = new URLSearchParams(search).get("heading");
    if (id && items.some((item) => item.id === id))
      document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [search, pathname, items]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const visible = items.filter(
          (item) =>
            (document.getElementById(item.id!)?.getBoundingClientRect().top ??
              Infinity) <= 120,
        );
        setActiveId(visible.at(-1)?.id ?? items[0]?.id ?? "");
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const updateMarker = () => {
      const active = nav.querySelector<HTMLElement>(
        'a[aria-current="location"]',
      );
      const marker = markerRef.current;
      if (!marker) return;
      marker.dataset.visible = String(Boolean(active));
      if (!active) return;
      const bounds = active.getBoundingClientRect();
      marker.style.setProperty(
        "--outline-marker-top",
        `${bounds.top - nav.getBoundingClientRect().top}px`,
      );
      marker.style.setProperty("--outline-marker-height", `${bounds.height}px`);
    };
    updateMarker();
    const observer = new ResizeObserver(updateMarker);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeId, items]);

  return (
    <nav ref={navRef} aria-label="Page headings">
      <span className="outline-marker" aria-hidden="true" ref={markerRef} />
      {items.map((item) => (
        <Link
          key={item.id}
          to={`${pathname}?heading=${encodeURIComponent(item.id!)}`}
          data-level={item.depth}
          aria-current={activeId === item.id ? "location" : undefined}
          onClick={() =>
            document
              .getElementById(item.id!)
              ?.scrollIntoView({ block: "start" })
          }
        >
          {item.value}
        </Link>
      ))}
    </nav>
  );
}
