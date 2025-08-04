// src/App.tsx
import MarkupParser from "./components/MarkupParser";
import FilePanel from "./components/FilePanel";
import GraphCanvas from "./components/GraphCanvas";
import MarkupControls from "./components/MarkupControls";
import { useStore } from "./lib/stateStore";

export default function App() {
  const toggleView = useStore(state => state.toggleDependencyView);
  const traceDeps = useStore(state => state.traceDependenciesFrom);
  const nodes = useStore(state => state.nodes);
  const edges = useStore(state => state.edges);
  const text = useStore(state => state.text);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div style={{ flex: 1, padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h2>Argument Text</h2>
        <MarkupParser />
        <MarkupControls />
        <hr style={{ margin: "1rem 0" }} />
        <button onClick={toggleView}>🎯 Toggle Dependency Highlights</button>
        <br />
        <button
          onClick={() => {
            const last = [...nodes].reverse().find(n => n.type === "claim");
            if (last) traceDeps(last.id);
          }}
        >
          🔍 Trace Dependencies of Last Claim
        </button>
				<button onClick={() => console.log("Graph debug:", [nodes, edges, text])}>
				  🧪 Print Graph State
				</button>

        <FilePanel />
      </div>

      <div style={{ flex: 2, padding: "1rem" }}>
        <h2>Graph Canvas</h2>
        <GraphCanvas />
      </div>
    </div>
  );
}
