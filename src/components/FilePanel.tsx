// src/components/FilePanel.tsx
import React, { useRef } from "react";
import { useStore } from "../lib/stateStore";
import YAML from "js-yaml";

export default function FilePanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const graph = useStore(state => state.graph);
  const highlights = useStore(state => state.highlights);
  const text = useStore(state => state.text);

  const setGraph = useStore(state => state.setGraph);
  const setHighlights = useStore(state => state.setHighlights);
  const setText = useStore(state => state.setText);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const yamlText = reader.result as string;
        const data = YAML.load(yamlText) as any;

        if (typeof data.text === "string") setText(data.text);
        if (Array.isArray(data.graph)) setGraph(data.graph);
        if (Array.isArray(data.highlights)) setHighlights(data.highlights);
      } catch (err) {
        alert("YAML import error: " + err);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const data = { text, graph, highlights };
    const yaml = YAML.dump(data);
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "argument.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={handleExport}>💾 Export</button>
      <input
        type="file"
        accept=".yaml,.yml"
        ref={fileRef}
        onChange={handleImport}
        style={{ display: "none" }}
      />
      <button onClick={() => fileRef.current?.click()}>📂 Import</button>
    </div>
  );
}
