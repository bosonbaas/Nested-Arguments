// src/lib/stateStore.ts
import { create } from "zustand";

export type Node = {
  id: string;
  type: "claim" | "reason";
  text: string;
  position: { x: number; y: number };
  width: number;
  height: number;

};

export type Highlight = {
  id: string;
  startOffset: number;
  endOffset: number;
  type: "claim" | "reason" | "annotation" | "dependency";
  refId?: string;
  color?: string;
};

interface StoreState {
  graph: Node[];
  highlights: Highlight[];
  text: string;
  dependencyView: boolean;

  setGraph: (graph: Node[]) => void;
  setHighlights: (h: Highlight[]) => void;
  setText: (txt: string) => void;

  addClaim: (text: string) => void;
  addReason: (text: string) => void;
  addHighlight: (start: number, end: number, type: string) => void;
  toggleDependencyView: () => void;
  traceDependenciesFrom: (nodeId: string) => void;

  updateGraph: (mutator: (draft: Node[]) => void) => void;
}

let nodeCounter = 0;

export const useStore = create<StoreState>((set, get) => ({
  graph: [],
  highlights: [],
  text: "",
  dependencyView: false,

  setGraph: graph => set(() => ({ graph })),
  setHighlights: h => set(() => ({ highlights: h })),
  setText: txt => set(() => ({ text: txt })),

  toggleDependencyView: () =>
    set(state => ({ dependencyView: !state.dependencyView })),

  addClaim: text =>
    set(state => ({
      graph: [
        ...state.graph,
        {
          id: `claim-${++nodeCounter}`,
          type: "claim",
          width: 100,
          height: 50,
          text,
          position: { x: 100, y: 100 + nodeCounter * 40 }
        }
      ]
    })),

  addReason: text =>
    set(state => ({
      graph: [
        ...state.graph,
        {
          id: `reason-${++nodeCounter}`,
          type: "reason",
          width: 100,
          height: 50,
          text,
          position: { x: 300, y: 100 + nodeCounter * 40 }
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

  updateGraph: (mutator) => {
    const current = [...get().graph]; // clone defensively
    mutator(current);
    set({ graph: current });
  }

}));
