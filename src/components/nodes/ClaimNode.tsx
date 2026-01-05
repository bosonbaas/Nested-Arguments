// src/components/nodes/ClaimNode.tsx
import { Handle, Position, NodeResizer } from "reactflow";

export default function ClaimNode({ id, data, selected} : any) {
  return (
    <div 
      style={{ position: "relative", 
        pointerEvents: "none",
        height: "100%",
        width: "100%"}}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="claim-in"
        key="in"
        style={{
          pointerEvents: "auto",
          left: "50%",
          transform: "translateX(-50%)"
        }}
      />

      <div
        style={{
          border: data.hover ? "2px solid #429916ff": "2px solid #52c41a",
          backgroundColor: data.hover ? "#b9c0b2ff" : "#f6ffed",
          borderRadius: 6,
          fontWeight: "bold",
          padding: 10,
          pointerEvents: "auto",
          overflow: "hidden",
          height: "100%",
          width: "100%"
        }}
      >
        {data.label}

        <NodeResizer
          color= {data.hover ? "#53c41ab2" : "#52c41a"}
          isVisible={selected}
          minWidth={30}
          minHeight={30}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="claim-out"
        key="out"
        style={{
          pointerEvents: "auto",
          left: "50%",
          transform: "translateX(-50%)"
        }}
      />
    </div>
  );
}
