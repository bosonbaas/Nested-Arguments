import React from "react";
import { useStore } from "../lib/stateStore";

export default function TextPane() {
  const text = useStore(state => state.text);
  const setText = useStore(state => state.setText);

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onInput={e => setText((e.target as HTMLDivElement).innerText)}
      style={{
        border: "1px solid #ccc",
        padding: "0.5rem",
        minHeight: "120px",
        whiteSpace: "pre-wrap"
      }}
    >
      {text}
    </div>
  );
}
