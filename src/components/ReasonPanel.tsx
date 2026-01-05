// src/components/ReasonPanel.tsx
import { useState, useEffect, useRef} from "react";
import { useArgStore} from "../lib/stateStore";
import { useShallow } from 'zustand/react/shallow';
import type { Edge, Node} from "../lib/stateStore";

//@ts-ignore stylesheet
import "../styles/ReasonPanel.css"

const selector = (state : any) => ({
  selectedNodes: state.selectedNodes
});
const node_selector = (state : any) => ({
  nodes: state.nodes,
  setNodeLabel: state.setNodeLabel,
  addPort: state.addPort,
  remPort: state.remPort
});

function DepConcEditor({cur_node}:any){
  const {addPort, remPort} = useArgStore(
    useShallow(node_selector),
  );
  const [depValue, setDepValue] = useState('');
  const [concValue, setConcValue] = useState('');

  return cur_node.type == "reason" ? (
    <div>
      <table>
          <thead>
            <tr><th scope="col" colSpan={2}>Dependencies</th></tr>
          </thead>
          <tbody>
          {cur_node.data.dependencies.map((d:any) => {
            return (
              <tr key={d}>
                <td>{d}</td>
                <td><button onClick={()=>remPort(cur_node, "dependency", d)}>🗑️</button></td>
              </tr>
            )
          })}
          <tr key="add_dep">
            <td><input type="text" id="port_id" value={depValue} onChange={(e) => setDepValue(e.target.value)}/></td>
            <td><button onClick={()=>addPort(cur_node, "dependency", depValue)}>Add Dependency</button></td>
          </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr><th scope="row" colSpan={2}>Conclusion</th></tr>
          </thead>
          <tbody>
          {cur_node.data.conclusions.map((d:any) => {
            return (
              <tr key={d}>
                <td>{d}</td>
                <td><button onClick={()=>remPort(cur_node, "conclusion", d)}>🗑️</button></td>
              </tr>
            )
          })}
          <tr key="add_conc">
            <td><input type="text" id="port_id" value={concValue} onChange={(e) => setConcValue(e.target.value)}/></td>
            <td><button onClick={()=>addPort(cur_node, "conclusion", concValue)}>Add Conclusion</button></td>
          </tr>
          </tbody>
        </table>
      </div>
    ) : null

}

function ReasonEditor({selectedID}:any){
  const {nodes, setNodeLabel} = useArgStore(
    useShallow(node_selector),
  );
  const cur_node = nodes.filter((n:Node) => n.id == selectedID)[0]

  // Save changes
  const handleInput = (event:any) => {
    setNodeLabel(cur_node, event.target.value);
  };

  return cur_node ?  (
    <div>
      <input
        id="reason_label"
        key="reason_label"
        value={cur_node.data.label}
        onInput={handleInput}
        style={{
          border: "1px solid #ccc",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word"
        }}
      />
      <DepConcEditor cur_node={cur_node} />
    </div>
  ) : null;
}

export default function ReasonPanel() {
  const {selectedNodes} = useArgStore(
    useShallow(selector),
  );  

  

  return (
    <div  className="reason-panel">
      <div>
      Reason Panel
      </div>
      {selectedNodes.length == 1 ? 
      <ReasonEditor 
        selectedID={selectedNodes[0].id}/> : null}
    </div>
  );
}
