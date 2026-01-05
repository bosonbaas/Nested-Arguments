// src/App.tsx
import FilePanel from "./components/FilePanel";
import GraphCanvas from "./components/GraphCanvas";
import ReasonPanel from "./components/ReasonPanel";
import EditorContainer from "./components/EditorContainer"
// TODO: Add Mantine styling (use it for re-sizing of divs)
// import { MantineProvider } from '@mantine/core';
import { useArgStore } from "./lib/stateStore";

export default function App() {

  // State tracked for state of debug. 
  const nodes = useArgStore(state => state.nodes);
  const edges = useArgStore(state => state.edges);
  const text = useArgStore(state => state.text);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div style={{ flex: 1, padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h2>Argument Text</h2>
        <EditorContainer />
        <hr style={{ margin: "1rem 0" }} />
        <button onClick={() => alert("Toggle dependencies")}>🎯 Toggle Dependency Highlights</button>
        <br />
        <button
          onClick={() => alert("Trace dependencies")}
        >
          🔍 Trace Dependencies of Last Claim
        </button>
        <button onClick={() => console.log("Graph debug:", [nodes, edges, text])}>
          🧪 Print Graph State
        </button>

        <FilePanel />
      </div>

      <div style={{display: "flex", flex: 2, padding: "1rem" }}>
        <div style = {{flex: 2, height: "100%"}}>
        <h2>Graph Canvas</h2>
        <GraphCanvas />
        </div>
      </div>
      <ReasonPanel />
    </div>
  );
}
