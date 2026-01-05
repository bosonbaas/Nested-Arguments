import type { Argument } from "./stateStore";
import type Delta from "quill-delta";
import type { Node, Edge } from "./stateStore";
import * as z from "zod";

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
  id: z.string(),
  name: z.string(),
  delta: z.any(),
  claims: z.array(ZodClaimAtRest),
  reasons: z.array(ZodReasonAtRest),
  highlights: z.array(ZodHighlightAtRest)
})

const ZodArgumentSuite = z.object({
  default_argument: z.string(),
  arguments: z.array(ZodArgumentAtRest)
})

type ClaimAtRest = z.infer<typeof ZodClaimAtRest>
type ReasonAtRest = z.infer<typeof ZodReasonAtRest>
type HighlightAtRest = z.infer<typeof ZodHighlightAtRest>

// Not infered from Zod because of the Delta type
type ArgumentAtRest = {
  id: string,
  name: string,
  delta: Delta,
  claims: ClaimAtRest[],
  reasons: ReasonAtRest[],
  highlights: HighlightAtRest[]
}

type ArgumentSuite = {
  default_argument: string,
  arguments: ArgumentAtRest[]
}

export function argumentFromYAML(yamlData: any){
  const parseResult = ZodArgumentAtRest.safeParse(yamlData)
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

  return {
    nodes: [...reasons, ...claims],
    edges: edges,
    highlights: data.highlights,
    delta: data.delta,
    name: data.name,
    id: data.id
  } as Argument
}

export function argumentsFromYAML(yamlData: any){
  const parseResult = ZodArgumentSuite.safeParse(yamlData)
  if(!parseResult.success){
    throw(parseResult.error)
  }
  const argSuite = parseResult.data as ArgumentSuite

  return {
    default_argument: argSuite.default_argument,
    arguments: argSuite.arguments.map(argumentFromYAML),
  }
}

export function argumentToYAML(argument:Argument, delta:Delta){

}