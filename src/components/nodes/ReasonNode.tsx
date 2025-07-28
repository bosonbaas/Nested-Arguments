// src/components/nodes/ReasonNode.tsx
import { Handle, Position, NodeResizer } from "reactflow";
import { useStore } from "../../lib/stateStore";

export default function ReasonNode({ id, data, selected } : any) {
  const updateGraph = useStore(s => s.updateGraph);
  const inputKeys = data.dependencies || [];
  const outputKeys = data.conclusions || [];
  const inputSpacing = 100 / (inputKeys.length + 1);
  const outputSpacing = 100 / (outputKeys.length + 1);

  return (
		<div style={{ position: "relative", pointerEvents: "auto" }}>  
      <NodeResizer
        color="#1890ff"
        isVisible={selected}
        minWidth={140}
        minHeight={60} 
        onResize={(e, { width, height }) => {
          console.log(data)
          updateGraph(draft => {
            const node = draft.find(n => n.id === id);
            if (node) {
              node.width = width;
              node.height = height;
            }
          });
        }}
      />
			{inputKeys.map((role : string, i : number) => (
        <Handle
          key={role}
          type="target"
          position={Position.Top}
          id={role}
          title={role}
          style={{
            pointerEvents: "auto",
            left: `${(i + 1) * inputSpacing}%`,
            transform: "translateX(-50%)"
          }}
        />
      ))}

      <div
        style={{
          border: "2px dashed #1890ff",
          backgroundColor: "#e6f7ff",
          borderRadius: 12,
          fontStyle: "italic",
          padding: 10,
          pointerEvents: "auto",
          overflow: "hidden"
        }}
      >
        {data.label}

      </div>

      {outputKeys.map((role : string, i : number) => (
        <Handle
          key={role}
          type="source"
          position={Position.Bottom}
          id={role}
          title={role}
          style={{
            pointerEvents: "auto",
            left: `${(i + 1) * outputSpacing}%`,
            transform: "translateX(-50%)"
          }}
        />
      ))}
	  </div>
  );
}
