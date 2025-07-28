// src/components/nodes/ClaimNode.tsx
import { Handle, Position, NodeResizer } from "reactflow";
import { useStore } from "../../lib/stateStore";

export default function ClaimNode({ id, data, selected } : any) {
  const updateGraph = useStore(s => s.updateGraph);

  return (
    <div style={{ position: "relative", pointerEvents: "none" }}>
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        key="in"
        style={{
          pointerEvents: "auto",
          left: "50%",
          transform: "translateX(-50%)"
        }}
      />

      <div
        style={{
          border: "2px solid #52c41a",
          backgroundColor: "#f6ffed",
          borderRadius: 6,
          fontWeight: "bold",
          padding: 10,
          pointerEvents: "auto",
          overflow: "hidden"
        }}
      >
        {data.label}

        <NodeResizer
          color="#52c41a"
          isVisible={selected}
          minWidth={100}
          minHeight={60}
          onResize={(e, { width, height }) => {
            updateGraph(draft => {
              const node = draft.find(n => n.id === id);
              if (node) {
                node.width = width;
                node.height = height;
              }
            });
          }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
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
