// src/App.tsx
import FilePanel from "./components/FilePanel";
import GraphCanvas from "./components/GraphCanvas";
import ReasonPanel from "./components/ReasonPanel";
import EditorContainer from "./components/EditorContainer"
import { useEffect } from "react";
import YAML from "js-yaml";
import { argumentsFromYAML } from "./lib/argumentUtils";
import { useArgStore } from "./lib/stateStore";

export default function App() {
  // State tracked for state of debug. 
  const nodes = useArgStore(state => state.nodes);
  const edges = useArgStore(state => state.edges);

  const setArgumentCache = useArgStore(state => state.setArgumentCache);
  const loadArgument = useArgStore(state => state.loadArgument);

  // Temporary fix. Will ultimately want to have a built out system for loading new arguments
  useEffect(() => {
    // Only load if no argument is present
    if (!useArgStore.getState().argumentID) {
      fetch("./x_squared_is_even.yaml")
        .then(res => res.text())
        .then(yamlText => {
          const rawData = YAML.load(yamlText);
          const newArgs = argumentsFromYAML(rawData);
          setArgumentCache(new Map(newArgs.arguments.map(a => [a.id, a])));
          loadArgument(newArgs.default_argument);
        })
        .catch(err => {
          alert("Failed to load default argument: " + err);
        });
    }
  }, []);

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
        <button onClick={() => console.log("Graph debug:", [nodes, edges])}>
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
