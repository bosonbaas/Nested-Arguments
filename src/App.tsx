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
  const breadCrumbs = useArgStore(state => state.breadCrumbs);
  const returnToArgument = useArgStore(state => state.returnToArgument);

  const setArgumentCache = useArgStore(state => state.setArgumentCache);
  const loadArgument = useArgStore(state => state.loadArgument);

  // Temporary fix. Will ultimately want to have a built out system for loading new arguments
  useEffect(() => {
    // Only load if no argument is present
    if (useArgStore.getState().breadCrumbs.length == 0) {
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

  const htmlBreadCrumbs = breadCrumbs.map((e, i) => {
    return (
      <button
        key = {i} 
        onClick= {() => returnToArgument(i)}
      >{e}</button>
    )
  })

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div style={{ flex: 1, padding: "1rem", borderRight: "1px solid #ccc" }}>
        {htmlBreadCrumbs}
        <EditorContainer />
        <hr style={{ margin: "1rem 0" }} />
        
        <button onClick={() => console.log("Graph debug:", [nodes, edges])}>
          🧪 Print Graph State to Console
        </button>

        <FilePanel />
      </div>

      <div style={{display: "flex", flex: 2, padding: "1rem" }}>
        <div style = {{flex: 2, height: "100%"}}>
        <GraphCanvas />
        </div>
      </div>
      <ReasonPanel />
    </div>
  );
}
