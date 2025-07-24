// src/components/GraphCanvas.tsx
import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "../lib/stateStore";
import ClaimNode from "./nodes/ClaimNode";
import ReasonNode from "./nodes/ReasonNode";

export default function GraphCanvas() {
  const graph = useStore(state => state.graph);

  const nodes: Node[] = useMemo(
    () =>
      graph.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        // ← pass width/height from your graph
        width: n.width,
        height: n.height,
        data: {
          label: n.text,
          dependencies: n.dependencies,
          conclusions: n.conclusions
        }
      })),
    [graph]
  );

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    for (const node of graph) {
      if (node.type === "reason") {
        for (const [role, claimId] of Object.entries(node.dependencies || {})) {
          result.push({
            id: `e-${claimId}-${node.id}-${role}`,
            source: claimId,
            target: node.id,
            targetHandle: `in-${role}`,
            type: "smoothstep"
          });
        }
        for (const [role, claimId] of Object.entries(node.conclusions || {})) {
          result.push({
            id: `e-${node.id}-${claimId}-${role}`,
            source: node.id,
            sourceHandle: `out-${role}`,
            target: claimId,
            type: "smoothstep"
          });
        }
      }
    }
    return result;
  }, [graph]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ claim: ClaimNode, reason: ReasonNode }}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
