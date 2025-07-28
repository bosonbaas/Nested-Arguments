// src/components/GraphCanvas.tsx
import { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from "reactflow";
import { useShallow } from 'zustand/react/shallow';
import "reactflow/dist/style.css";
import { useStore } from "../lib/stateStore";
import ClaimNode from "./nodes/ClaimNode";
import ReasonNode from "./nodes/ReasonNode";


const nodeTypes = {
  claim: ClaimNode, reason: ReasonNode
};
const selector = (state : any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export default function GraphCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    useShallow(selector),
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
