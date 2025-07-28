// src/lib/stateStore.ts
import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

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
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export type Highlight = {
  id: string;
  startOffset: number;
  endOffset: number;
  type: string;//"claim" | "reason" | "annotation" | "dependency";
  refId?: string;
  color?: string;
};

interface StoreState {
  nodes: Node[];
  edges: Edge[];
  highlights: Highlight[];
  text: string;
  dependencyView: boolean;

  setGraph: (nodes: Node[], edges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setHighlights: (h: Highlight[]) => void;
  setText: (txt: string) => void;

  addClaim: (text: string) => void;
  addReason: (text: string) => void;
  addHighlight: (start: number, end: number, type: string) => void;
  toggleDependencyView: () => void;
  traceDependenciesFrom: (nodeId: string) => void;

  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  updateGraph: (mutator: (draft: Node[]) => void) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  highlights: [],
  text: "",
  dependencyView: false,

  setGraph: (nodes, edges) => set(() => ({ nodes, edges })),
  setNodes: (nodes) => set(() => ({nodes})),
  setEdges: (edges) => set(() => ({edges})),
  setHighlights: h => set(() => ({ highlights: h })),
  setText: txt => set(() => ({ text: txt })),

  toggleDependencyView: () =>
    set(state => ({ dependencyView: !state.dependencyView })),

  addClaim: label =>
    set(state => ({
      nodes: [
        ...state.nodes,
        {
          id: `claim-${state.nodes.length}`,
          type: "claim",
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

  addReason: label =>
    set(state => ({
      nodes: [
        ...state.nodes,
        {
          id: `reason-${state.nodes.length}`,
          type: "reason",
          width: 100,
          height: 50,
          position: { x: 300, y: 100 + state.nodes.length * 40 },
          data:{
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
  onConnect: (connection) => {
    set((state) => ({
      edges: [
        ...state.edges,
        {...connection, id: `edge-${state.edges.length}`}
      ]
    }));
  },

  updateGraph: (mutator) => {
    const current = [...get().graph]; // clone defensively
    mutator(current);
    set({ graph: current });
  }

}));
