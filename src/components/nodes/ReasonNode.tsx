// src/components/nodes/ReasonNode.tsx
import {useEffect} from "react";
import { Handle, Position, NodeResizer, useUpdateNodeInternals} from "reactflow";


export default function ReasonNode({ id, data, selected} : any) {
  const inputKeys = data.dependencies || [];
  const outputKeys = data.conclusions || [];
  const inputSpacing = 100 / (inputKeys.length + 1);
  const outputSpacing = 100 / (outputKeys.length + 1);

  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(()=>{
    updateNodeInternals(id);
  }, [data.dependencies, data.conclusions])

  return (
		<div 
      style={{ 
        position: "relative", 
        pointerEvents: "auto",
        height: "100%",
        width: "100%" }}
    >  
      <NodeResizer
        color= {data.hover ? "#1275d1ff": "#1890ff"}
        isVisible={selected}
        minWidth={30}
        minHeight={30}
      />
			{inputKeys.map((role : string, i : number) => (
        <Handle
          key={role}
          type="target"
          position={Position.Top}
          id={"reason-in-" + role}
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
          border: data.hover ? "2px dashed #1275d1ff": "2px dashed #1890ff",
          backgroundColor: data.hover ? "#b9c7ceff" : "#e6f7ff",
          borderRadius: 12,
          fontStyle: "italic",
          padding: 10,
          pointerEvents: "auto",
          overflow: "hidden",
          height: "100%",
          width: "100%"
        }}
      >
        {data.label}

      </div>

      {outputKeys.map((role : string, i : number) => (
        <Handle
          key={role}
          type="source"
          position={Position.Bottom}
          id={"reason-out-" + role}
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
