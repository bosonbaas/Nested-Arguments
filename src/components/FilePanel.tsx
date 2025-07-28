// src/components/FilePanel.tsx
import React, { useRef } from "react";
import { useStore} from "../lib/stateStore";
import { useShallow } from 'zustand/react/shallow';
import type { Edge, Node} from "../lib/stateStore";
import YAML from "js-yaml";

const selector = (state : any) => ({
  highlights: state.highlights,
  text: state.text,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  setHighlights: state.setHighlights,
  setText: state.setText,
});

export default function FilePanel() {
  const fileRef = useRef<HTMLInputElement>(null);

  const { highlights, text, setNodes, setEdges, setHighlights, setText } = useStore(
    useShallow(selector),
  );

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const yamlText = reader.result as string;
        const data = YAML.load(yamlText) as any;
        var edges : Edge[] = [];
        var reasons : Node[] = [];
        var claims : Node[] = [];
        var edge_counter = 0;
        if (Array.isArray(data.reasons)){
          reasons = data.reasons.map((n : any) => {
            const dependencies = Object.keys(n.dependencies);
            const conclusions = Object.keys(n.conclusions);
            Object.entries(n.dependencies).map(([k ,v] : any) => {
              edges.push({
                id: `edge-${++edge_counter}`,
                source: v,
                sourceHandle: "out",
                target: `${n.id}`,
                targetHandle: k
              })
            });
            Object.entries(n.conclusions).map(([k,v] : any) => {
              edges.push({
                id: `edge-${++edge_counter}`,
                target: v,
                targetHandle: "in",
                source: n.id,
                sourceHandle: k
              })
            });
            return { id: n.id,
              type: "reason",
              position: n.position,
              data:{
                label: n.label,
                dependencies: dependencies,
                conclusions: conclusions
              }
            }
          })
        }
        if (Array.isArray(data.claims)){
          claims = data.claims.map((c : any) => ({ id: c.id,
              type: "claim",
              position: c.position,
              data:{
                label: c.label,
                dependencies: [],
                conclusions: []
              }
            }))
        }

        if (typeof data.text === "string") setText(data.text);
        setNodes(claims.concat(reasons))
        setEdges(edges)
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
