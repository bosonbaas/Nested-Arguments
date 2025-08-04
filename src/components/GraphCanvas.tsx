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
import type {Connection, Edge} from "reactflow";


const nodeTypes = {
  claim: ClaimNode, reason: ReasonNode
};
const selector = (state : any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onNodesDelete: state.onNodesDelete,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export default function GraphCanvas() {
  const { nodes, edges, onNodesChange, onNodesDelete, onEdgesChange, onConnect } = useStore(
    useShallow(selector),
  );

  
  const isValidConnection = (connection: Connection) => {
    if(connection.sourceHandle && connection.targetHandle){
      const isdup = edges.find((edge: Edge) => 
        edge.source === connection.source && edge.sourceHandle === connection.sourceHandle &&
           edge.target === connection.target && edge.targetHandle === connection.targetHandle
      )
      return !isdup && (connection.sourceHandle.startsWith("claim-out") && connection.targetHandle.startsWith("reason-in") ||
            connection.sourceHandle.startsWith("reason-out") && connection.targetHandle.startsWith("claim-in"));
    }
    return false;
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
