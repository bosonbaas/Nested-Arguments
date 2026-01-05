import React from "react";
import { useArgStore } from "../lib/stateStore";

export default function TextPane() {
  const text = useArgStore(state => state.text);
  const setText = useArgStore(state => state.setText);

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      id ="argument_pane"
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
