// src/lib/stateStore.ts
import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges, addEdge} from 'reactflow';
import type {Connection} from 'reactflow'

export type Node = {
  // This ID must be unique. Text is used to give a human-readable string
  id: string;
  type: "claim" | "reason";
  position: { x: number; y: number };
  width: number;
  height: number;
  // Dependencies describe the input ports and their ids
  data: {
    label: string;
    dependencies: string[];
    conclusions: string[];
  }
};

export type Edge = {
  id: string;
  source: string | null;
  sourceHandle: string | null;
  target: string | null;
  targetHandle: string | null;
}

export type Highlight = {
  id: string;
  startOffset: number;
  endOffset: number;
  type: string;//"claim" | "reason" | "annotation" | "dependency";
  refId?: string;
  color?: string;
};

function deleteHighlight(html: string, id: string) : string {
  const div = document.createElement("div");
  div.innerHTML = html;
  let rem_node = div.querySelector("#" + id)
  rem_node?.replaceWith(rem_node.innerHTML)
  return div.innerHTML;
}

interface StoreState {
  id_ind: number;
  nodes: Node[];
  edges: Edge[];
  highlights: Highlight[];
  text: string;
  dependencyView: boolean;

  setIdInd: (ind: number) => void;
  setGraph: (nodes: Node[], edges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setHighlights: (h: Highlight[]) => void;
  setText: (txt: string) => void;

  addNode: (text: string, node_type: "claim" | "reason", id: string) => void;
  addHighlight: (start: number, end: number, type: string) => void;
  toggleDependencyView: () => void;
  traceDependenciesFrom: (nodeId: string) => void;

  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodesDelete: (deleted: any) => void;
  updateGraph: (mutator: (draft: Node[]) => void) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  id_ind: 0,
  nodes: [],
  edges: [],
  highlights: [],
  text: "",
  dependencyView: false,

  setIdInd: (ind) => set(() => ({id_ind: ind})),
  setGraph: (nodes, edges) => set(() => ({ nodes, edges })),
  setNodes: (nodes) => set(() => ({nodes})),
  setEdges: (edges) => set(() => ({edges})),
  setHighlights: h => set(() => ({ highlights: h })),
  setText: txt => set(() => ({ text: txt })),

  toggleDependencyView: () =>
    set(state => ({ dependencyView: !state.dependencyView })),

  addNode: (label, node_type) =>
    set(state => ({
      id_ind: state.id_ind + 1,
      nodes: [
        ...state.nodes,
        {
          id: `${node_type[0]}${state.id_ind}`,
          type: node_type,
          width: 100,
          height: 50,
          position: { x: 100, y: 100 + state.nodes.length * 40 },
          data: {
            label,
            dependencies: [],
            conclusions: []
          }
        }
      ]
    })),

  addHighlight: (start, end, type) =>
    set(state => ({
      highlights: [
        ...state.highlights,
        {
          id: `hl-${Date.now()}`,
          startOffset: start,
          endOffset: end,
          type
        }
      ]
    })),

  traceDependenciesFrom: nodeId => {
    const visited = new Set<string>();
    const highlights: Highlight[] = [];
    const baseHue = Math.floor(Math.random() * 360);

    const dfs = (id: string, depth: number, hue: number) => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = get().graph.find(n => n.id === id);
      if (!node || node.type !== "claim") return;

      const match = get().highlights.find(h => h.refId === id);
      if (!match) return;

      const lightness = 85 - depth * 10;
      const color = `hsl(${hue}, 70%, ${lightness}%)`;

      highlights.push({
        ...match,
        id: `dep-${id}-${depth}`,
        type: "dependency",
        color
      });

      get().graph
        .filter(n => n.supports?.includes(id))
        .forEach(parent => dfs(parent.id, depth + 1, hue));
    };

    dfs(nodeId, 0, baseHue);
    set(() => ({ highlights }));
  },

  onNodesChange: (changes) => {
    set({nodes: applyNodeChanges(changes, get().nodes)})
    console.log("nodes changed")
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set((state) => ({
      edges: [
        ...state.edges,
        {...connection, id: `edge-${connection.target}_${connection.targetHandle}-${connection.source}_${connection.sourceHandle}`}
      ]
    }));
  },

  onNodesDelete: (deleted) => {
    set((state) => {
      const del_ids = deleted.map((n: Node) => n.id)
      const text = deleted.reduce((acc: string, cur: Node) => deleteHighlight(acc, cur.id), state.text)
      const nodes = state.nodes.filter((n:Node) => !del_ids.includes(n.id))
      const edges = state.edges.filter((e:Edge) => !(del_ids.includes(e.target) || del_ids.includes(e.source)))
      return {nodes, edges, text}
    })
  },

  updateGraph: (mutator) => {
    const current = [...get().graph]; // clone defensively
    mutator(current);
    set({ graph: current });
  }

}));
