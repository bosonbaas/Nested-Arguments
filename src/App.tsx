// src/App.tsx
import React from "react";
import MarkupParser from "./components/MarkupParser";
import FilePanel from "./components/FilePanel"; // ⬅️ Import it!
import GraphCanvas from "./components/GraphCanvas";
import MarkupControls from "./components/MarkupControls.tsx";
import { useStore } from "./lib/stateStore";

export default function App() {
  const toggleView = useStore(state => state.toggleDependencyView);
  const traceDeps = useStore(state => state.traceDependenciesFrom);
  const graph = useStore(state => state.graph);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div style={{ flex: 1, padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h2>Argument Text</h2>
        <MarkupControls />
        <MarkupParser />
        <hr style={{ margin: "1rem 0" }} />
        <button onClick={toggleView}>🎯 Toggle Dependency Highlights</button>
        <br />
        <button
          onClick={() => {
            const last = [...graph].reverse().find(n => n.type === "claim");
            if (last) traceDeps(last.id);
          }}
        >
          🔍 Trace Dependencies of Last Claim
        </button>
				<button onClick={() => console.log("Graph debug:", useStore.getState().graph)}>
				  🧪 Print Graph State
				</button>


        {/* 🗂️ Render FilePanel here */}
        <FilePanel />
      </div>

      <div style={{ flex: 2, padding: "1rem" }}>
        <h2>Graph Canvas</h2>
        <GraphCanvas />
      </div>
    </div>
  );
}
