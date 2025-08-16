// src/components/ReasonPanel.tsx
import { useRef, useState } from "react";
import { useStore} from "../lib/stateStore";
import { useShallow } from 'zustand/react/shallow';
import type { Edge, Node} from "../lib/stateStore";

const selector = (state : any) => ({
  nodes: state.nodes,
  selectedNodes: state.selectedNodes,
  addPort: state.addPort,
  remPort: state.remPort
});

export default function ReasonPanel() {
  const {nodes, selectedNodes, addPort, remPort} = useStore(
    useShallow(selector),
  );
  
  function ReasonEditor({selectedID}:any){
    const [depValue, setDepValue] = useState('');
    const [concValue, setConcValue] = useState('');
    const cur_node = nodes.filter((n:Node) => n.id == selectedID)[0]
    
    return cur_node ?  (
      <div>
      <div>
        {cur_node.data.label}
      </div>
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
    ) : null;
  }

  return (
    <div style = {{flex: 1, height: "100%"}}>
      <div>
      Reason Panel
      </div>
      {selectedNodes.length == 1 ? 
      <ReasonEditor 
        selectedID={selectedNodes[0].id}/> : null}
    </div>
  );
}
