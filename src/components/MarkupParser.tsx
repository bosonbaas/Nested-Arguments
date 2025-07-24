// src/components/MarkupParser.tsx
import React, { useEffect, useRef } from "react";
import { useStore } from "../lib/stateStore";

export default function MarkupParser() {
  const text = useStore(state => state.text);
  const setText = useStore(state => state.setText);
  const ref = useRef<HTMLDivElement>(null);

  // Rehydrate on mount/update
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = tagToSpan(text);
    }
  }, [text]);

  // Save changes
  const handleInput = () => {
    if (ref.current) {
      const html = ref.current.innerHTML;
      const updated = spanToTag(html);
      setText(updated);
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      style={{
        border: "1px solid #ccc",
        padding: "0.75rem",
        borderRadius: "6px",
        minHeight: "120px",
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word"
      }}
    />
  );
}

// Converts <claim id="c1">text</claim> into styled <span> for editing
function tagToSpan(text: string): string {
  return text
    .replace(/<claim id="(.*?)">(.*?)<\/claim>/g, (_, id, content) =>
      `<span class="highlight claim" data-refid="${id}">${content}</span>`
    )
    .replace(/<reason id="(.*?)">(.*?)<\/reason>/g, (_, id, content) =>
      `<span class="highlight reason" data-refid="${id}">${content}</span>`
    );
}

// Converts back from styled <span> into tag-based text
function spanToTag(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  // Replace all tagged spans with custom tags
  const spans = div.querySelectorAll("span.highlight");
  spans.forEach(span => {
    const ref = span.getAttribute("data-refid");
    const type = span.classList.contains("claim") ? "claim" : "reason";
    const tag = document.createElement(type);
    tag.setAttribute("id", ref || "");

    tag.innerHTML = span.innerHTML;
    span.replaceWith(tag);
  });

  return div.innerHTML;
}
