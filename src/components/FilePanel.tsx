// src/components/FilePanel.tsx
import React, { useRef } from "react";
import { useArgStore } from "../lib/stateStore";
import { useShallow } from 'zustand/react/shallow';
import type { Edge, Node, NodeType } from "../lib/stateStore";
import Delta from "quill-delta";
import YAML from "js-yaml";
import * as z from "zod";

type IntermedNode = {
  id: string,
  label: string,
  type: NodeType,
  height: Number,
  width: Number,
  position: {x: Number, y: Number},
  dependencyOrder: string[],
  conclusionOrder: string[],
  dependencies: {[key: string]: string | null},
  conclusions: {[key: string]: string | null}
}

const ZodClaimAtRest = z.object({
  id: z.string(),
  label: z.string(),
  height: z.number(),
  width: z.number(),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
})

const ZodReasonAtRest = z.object({
  id: z.string(),
  label: z.string(),
  height: z.number(),
  width: z.number(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  dependencies: z.array(
    z.tuple(
      [z.union([z.string(), z.null()]),
       z.union([z.string(), z.null()])]
    )
  ),
  conclusions: z.array(
    z.tuple(
      [z.union([z.string(), z.null()]),
       z.union([z.string(), z.null()])]
    )
  )
})

const ZodHighlightAtRest = z.object({
  id: z.string(),
  node_id: z.string(),
  type: z.string()
})

// Would love some validation on the Delta type, but it appears that will
// have to be custom, according to https://github.com/slab/quill/issues/3029
const ZodArgumentAtRest = z.object({
  delta: z.any(),
  claims: z.array(ZodClaimAtRest),
  reasons: z.array(ZodReasonAtRest),
  highlights: z.array(ZodHighlightAtRest)
})

type ClaimAtRest = z.infer<typeof ZodClaimAtRest>
type ReasonAtRest = z.infer<typeof ZodReasonAtRest>
type HighlightAtRest = z.infer<typeof ZodHighlightAtRest>

// Not infered from Zod because of the Delta type
type ArgumentAtRest = {
  delta: Delta,
  claims: ClaimAtRest[],
  reasons: ReasonAtRest[],
  highlights: HighlightAtRest[]
}

const selector = (state: any) => ({
  highlights: state.highlights,
  text: state.text,
  setIdInd: state.setIdInd,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  addHighlight: state.addHighlight,
  setText: state.setText,
});

export default function FilePanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const argumentEditor = useArgStore(state => state.argumentEditor);

  // useShallow may not make sense here
  const { highlights, text, setNodes, setEdges, addHighlight, setText } = useArgStore(
    useShallow(selector),
  );

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const yamlText = reader.result as string;
        const rawData = YAML.load(yamlText) as any;
        const parseResult = ZodArgumentAtRest.safeParse(rawData)
        if(!parseResult.success){
          alert("Zod parse error: " + parseResult.error.message);
        }
        const data = parseResult.data as ArgumentAtRest
        const edges: Edge[] = [];
        let reasons: Node[] = [];
        let claims: Node[] = [];
        let edge_counter = 0;
        reasons = data.reasons.map((n) => {
          const dependencies = n.dependencies.map(([k,_])=>k);
          const conclusions = n.conclusions.map(([k,_])=>k);
          n.dependencies.forEach(([k ,v] : [string | null, string | null]) => {
            if(!v){
              return;
            }
            edges.push({
              id: `edge-${++edge_counter}`,
              source: v,
              sourceHandle: "claim-out",
              target: n.id,
              targetHandle: `reason-in-${k}`
            })
          });
          n.conclusions.forEach(([k,v] : [string | null, string | null]) => {
            if(!v){
              return;
            }
            edges.push({
              id: `edge-${++edge_counter}`,
              target: v,
              targetHandle: "claim-in",
              source: n.id,
              sourceHandle: `reason-out-${k}`
            })
          });
          return {
            id: n.id,
            type: "reason",
            style:{
              height: n.height,
              width: n.width
            },
            height: n.height,
            width: n.width,
            position: n.position,
            data: {
              label: n.label,
              dependencies: dependencies,
              conclusions: conclusions,
            },
          } as Node;
        })
        
        claims = data.claims.map((c) => ({
          id: c.id,
          type: "claim",
          style:{
            height: c.height,
            width: c.width
          },
          position: c.position,
          data: {
            label: c.label,
            dependencies: [] as string[],
            conclusions: [] as string[],
          }
        } as Node))

        console.log(claims)

        argumentEditor?.setContents(data.delta);

        setNodes([...reasons, ...claims]);
        setEdges(edges);

        data.highlights.forEach((hl) => {
          addHighlight(hl.type, hl.node_id, hl.id)
        })
      } catch (err) {
        alert("YAML import error: " + err);
      }
    };
    reader.readAsText(file);
  };

  /**
   * Exports the current state of the quill editor and graph into the at-rest yaml format.
   * 
   * TODO: This function will need to be udpated to support multiple arguments 
   * in a grouping of arguments.
   */
  const handleExport = () => {
    if(!argumentEditor){
      alert("Editor not yet loaded, please wait.")
      return false
    }
    const delta = argumentEditor.getContents()
    const nodes = useArgStore.getState().nodes.reduce((acc, node) => {
      acc[node.id] = {
          id: node.id,
          label: node.data.label,
          type: node.type,
          height: node.height,
          width: node.width,
          position: node.position,
          dependencyOrder: node.data.dependencies,
          conclusionOrder: node.data.conclusions,
          dependencies: node.data.dependencies.reduce((acc, dep) => {
            acc[dep] = null
            return acc
          } ,{} as {[key: string]: string | null}),
          conclusions: node.data.conclusions.reduce((acc, dep) => {
            acc[dep] = null
            return acc
          } ,{} as {[key: string]: string | null}),
        }
      return acc
    }, {} as {[key: string]: IntermedNode})
    const edges = useArgStore.getState().edges;
    edges.forEach((e) => {
      if(e.target && e.source && e.sourceHandle && e.targetHandle){
        const srcType = e.sourceHandle?.split("-")[0]

        // ASSUME: The edge is either going from a reason to a claim or claim to reason.
        if(srcType == "claim") {
          const tgtName = e.target.split("-")[0]
          const srcName = e.source.split("-")[0]
          const depName = e.targetHandle.split("-")[2]
          nodes[tgtName].dependencies[depName] = srcName
        } else {
          const tgtName = e.target.split("-")[0]
          const srcName = e.source.split("-")[0]
          const concName = e.sourceHandle.split("-")[2]
          nodes[srcName].conclusions[concName] = tgtName
        }
      }
    })

    // Break nodes into type-based groups. Maybe unnecessary, but I like how it looks in the .yaml
    const claims = Object.values(nodes)
      .filter((node) => node.type === "claim")
      .map((node) => ({
        id: node.id,
        label: node.label,
        width: node.width,
        height: node.height,
        position: node.position
      } as ClaimAtRest))
    const reasons = Object.values(nodes)
      .filter((node) => node.type === "reason")
      .map((node) => ({
        id: node.id,
        label: node.label,
        position: node.position,
        width: node.width,
        height: node.height,
        dependencies: node.dependencyOrder.map((dep) => [dep, node.dependencies[dep]]),
        conclusions: node.conclusionOrder.map((conc) => [conc, node.conclusions[conc]])
      } as ReasonAtRest))
    const highlights = useArgStore.getState().highlights
      .map((hl) => ({
        id: hl.id,
        node_id: hl.node_id,
        type: hl.type
      } as HighlightAtRest))
    const data = { delta, claims, reasons, highlights } as ArgumentAtRest;
    const yaml = YAML.dump(data);
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    try{
      const a = document.createElement("a");
      a.href = url;
      a.download = "argument.yaml";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={handleExport}>💾 Export</button>
      <input
        type="file"
        accept=".yaml,.yml"
        ref={fileRef}
        onChange={handleImport}
        style={{ display: "none" }}
      />
      <button onClick={() => fileRef.current?.click()}>📂 Import</button>
    </div>
  );
}
