import React from "react";

export interface Highlight {
  id: string;
  startOffset: number;
  endOffset: number;
  type: "claim" | "reason" | "annotation";
  refId?: string;
}

interface HighlightedTextProps {
  text: string;
  highlights: Highlight[];
  onClickHighlight?: (highlight: Highlight) => void;
}

export default function HighlightRenderer({ text, highlights, onClickHighlight }: HighlightedTextProps) {
  // Sort highlights by start offset to avoid rendering overlap issues
  const sorted = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
  const output: React.ReactNode[] = [];

  let current = 0;
  sorted.forEach((hl, i) => {
    const before = text.slice(current, hl.startOffset);
    if (before) output.push(<span key={`b-${i}`}>{before}</span>);

    const frag = text.slice(hl.startOffset, hl.endOffset);
    output.push(
      <span
        key={hl.id}
        className={`highlight ${hl.type}`}
        onClick={() => onClickHighlight?.(hl)}
        style={{ backgroundColor: getColor(hl.type) }}
      >
        {frag}
      </span>
    );

    current = hl.endOffset;
  });

  const rest = text.slice(current);
  if (rest) output.push(<span key="rest">{rest}</span>);

  return <div>{output}</div>;
}

function getColor(type: string) {
  switch (type) {
    case "claim":
      return "#d9f7be"; // light green
    case "reason":
      return "#fff1b8"; // light yellow
    case "annotation":
      return "#ffd6e7"; // soft pink
    default:
      return "#e6f7ff"; // default blue-ish
  }
}
