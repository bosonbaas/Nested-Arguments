// src/lib/stateStore.ts
import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges} from 'reactflow';
import type {Connection} from 'reactflow'
import { customAlphabet } from "nanoid"
import type Quill from "quill";
import type Delta from "quill-delta";

export const customNanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

export type NodeType = "claim" | "reason" | "comment" | "rebuttal"

// Will want to create types of "claim", "reason", "comment", and "rebuttal" that extend the node type.
export type Node = {
  // This ID must be unique. Text is used to give a human-readable string
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  width: number;
  height: number;
  initialWidth?: number;
  initialHeight?: number;
  style?: any;
  justification?: string;
  // Dependencies describe the input ports and their ids
  data: {
    hover: boolean;
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
  node_id: string;
  hover: boolean;
  type: NodeType;
};

export type Argument = {
  nodes: Node[];
  edges: Edge[];
  highlights: Highlight[];
  delta: Delta;
  name: string;
  id: string
}

export interface StoreState {

  // Contains any arguments contained in the imported file, as well as any
  // arguments previously loaded from online sources.
  argumentCache: Map<string, Argument>;
  breadCrumbs: string[],

  nodes: Node[];
  edges: Edge[];
  highlights: Highlight[];
  name: string;
  argumentEditor:Quill | null;

//  dependencyView: boolean;

  /* Maybe it would make more sense query these things as I go with handlers...
   *  But I feel that it'll be more convenient to have these as state, rather 
   *  than adding an hooks everywhere I need them. I'll handle updating these 
   *  in GraphCanvas.
   */ 
  selectedNodes: Node[];
  selectedEdges: Edge[];

  setGraph: (nodes: Node[], edges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setHighlights: (h: Highlight[]) => void;
  setName: (name: string) => void;
  setArgumentCache: (args: Map<string, Argument>) => void;

  setSelectedNodes: (nodes: Node[]) => void;
  setSelectedEdges: (edges: Edge[]) => void;

  // Update node data
  addPort: (node: Node, port_type: "dependency" | "conclusion", port_id: string) => void;
  remPort: (node: Node, port_type: "dependency" | "conclusion", port_id: string) => void;
  setNodeLabel: (node: Node, label:string) => void
  setNodeSize: (node_id: string, width: number, height: number) => void

  addNode: (text: string, node_type: NodeType) => string;
  addHighlightFromNode: (node:Node) => string;
  addHighlight: (type:NodeType, node_id:string, highlight_id?:string) => string;
  remHighlight: (id:string) => void;
  remAllNodeHighlights: (node_id:string) => void;
//  toggleDependencyView: () => void;
//  traceDependenciesFrom: (nodeId: string) => void;

  // Update highlight state
  setHover: (node_id: string, hover: boolean) => void;

  // Update Quill
  setArgumentEditor: (argumentEditor: Quill) => void;

  // Update Listeners
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodesDelete: (deleted: any) => void;

  // Update current active argument
  saveArgument: () => void;
  loadArgument: (new_arg: string, breadCrumbs?: string[]) => boolean;
  switchArgument: (new_arg: string, breadCrumbs?: string[]) => boolean;
  stepIntoArgument: (new_arg: string) => boolean;
  returnToArgument: (breadcrumb_index: number) => boolean;
}

export const useArgStore = create<StoreState>((set, get) => ({
  argumentCache: new Map(),
  breadCrumbs: [],

  nodes: [],
  edges: [],
  highlights: [],
  name: "",
  importedText: "",
  argumentEditor: null,
//  dependencyView: false,

  selectedNodes: [],
  selectedEdges: [],

  setGraph: (nodes, edges) => set(() => ({ nodes, edges })),
  setNodes: (nodes) => set(() => ({nodes})),
  setEdges: (edges) => set(() => ({edges})),
  setHighlights: h => set(() => ({ highlights: h })),
  setName: name => set(() => ({ name })),
  setArgumentCache: argumentCache => set(() => ({ argumentCache })),

  setSelectedNodes: nodes => set(() => ({ selectedNodes: nodes })),
  setSelectedEdges: edges => set(() => ({ selectedEdges: edges })),

  addPort: (node, port_type, port_id) => set(state => ({
    nodes: state.nodes.map(n => {
      if(n.id == node.id){
        if(port_type == "dependency"){
          n.data.dependencies.map(d => d != port_id).every(Boolean) || (() => {throw "ID already in use"})();
          return {
            ...n,
            data: {
              ...n.data,
              dependencies: [...n.data.dependencies, port_id]
            }
          }
        } else if(port_type == "conclusion"){
          n.data.conclusions.map(d => d != port_id).every(Boolean) || (() => {throw "ID already in use"})();
          return {
            ...n,
            data: {
              ...n.data,
              conclusions: [...n.data.conclusions, port_id]
            }
          }
        }
      }
      return n
    })
  })),

  remPort: (node, port_type, port_id) => set(state => ({
    nodes: state.nodes.map(n => {
      if(n.id == node.id){
        if(port_type == "dependency"){
          return {
            ...n,
            data: {
              ...n.data,
              dependencies: n.data.dependencies.filter(d => !(d == port_id))
            }
          }
        } else if(port_type == "conclusion"){
          return {
            ...n,
            data: {
              ...n.data,
              conclusions: n.data.conclusions.filter(d => !(d == port_id))
            }
          }
        }
      }
      return n
    }),
    edges: state.edges.filter(e => {
      if(port_type == "dependency"){
        return !(e.target == node.id && e.targetHandle == "reason-in-" + port_id)
      } else if(port_type == "conclusion"){
        return !(e.source == node.id && e.sourceHandle == "reason-out-" + port_id)
      }
      return true
    })
  })),

  setNodeLabel: (node, label) => set( state => ({
    nodes: state.nodes.map(n => {
      if(n.id == node.id){
        return {
          ...n,
          data: {
            ...n.data,
            label: label
          }
        }
      }
      return n
    })})
  ),

  setNodeSize: (node_id, width, height) => set( state => ({
    nodes: state.nodes.map(n => {
      if(n.id == node_id){
        return {
          ...n,
          width: width,
          height: height
        }
      }
      return n
    })})
  ),

//  toggleDependencyView: () =>
//    set(state => ({ dependencyView: !state.dependencyView })),

  addNode: (label, node_type) => {
    const id = `${node_type[0]}${customNanoid()}`
    set(state => ({
      nodes: [
        ...state.nodes,
        {
          id,
          type: node_type,
          width: 100,
          height: 50,
          position: { x: 100, y: 100 + state.nodes.length * 40 },
          data: {
            hover: false,
            label,
            dependencies: [],
            conclusions: []
          }
        }
      ]
    })) 
    return id; 
  },

  addHighlightFromNode: (node) =>{
    const id = customNanoid();
    set(state => ({
      highlights: [
        ...state.highlights,
        {
          id,
          node_id: node.id,
          hover: false,
          type: node.type
        }
      ]
    }))
    return id
  },

  addHighlight: (type, node_id, highlight_id=undefined) => {
    const id = highlight_id ? highlight_id : customNanoid()
    set(state => ({
      highlights: [
        ...state.highlights,
        {
          id,
          node_id,
          hover: false,
          type
        }
      ]
    }))
    return id
  },

  remHighlight: (id) =>
    set(state => ({
      highlights: state.highlights.filter((hl) => {
        hl.id !== id
      })
    })),

  // Note that this just manages state, and does not manage the actual
  // highlight in Quill.js
  remAllNodeHighlights: (node_id) =>
    set(state => ({
      highlights: state.highlights.filter((hl) => {
        hl.node_id !== node_id
      })
    })),

  setHover: (node_id, hover) =>
    set(state => {
      const highlights = state.highlights.map((el) => {
        if (el.node_id === node_id) {
          return { ...el, hover };
        } else {
          return el;
        }
      }) 
      const nodes = state.nodes.map((el) => {
        if (el.id === node_id) {
          return { 
            ...el, 
            data:{
              ...el.data,
              hover
            }
          };
        } else {
          return el;
        }
      })
      return { highlights, nodes }
    }),

  setArgumentEditor: (argumentEditor) =>
    set(state => ({argumentEditor})),
/*
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
*/
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node[]
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges as any) as Edge[],
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
      const nodes = state.nodes.filter((n:Node) => !del_ids.includes(n.id))
      const edges = state.edges.filter((e:Edge) => !(del_ids.includes(e.target) || del_ids.includes(e.source)))
      const highlights = state.highlights.filter((hl:Highlight) => !(del_ids.includes(hl.node_id)))
      return {nodes, edges, highlights}
    })
  },

  /**
   * Loads argument from argument stache, overwriting the current argument data
   */
  loadArgument: (arg_id, breadCrumbs = []) => {
    if(get().argumentCache.has(arg_id)){
      set((state) => {
        const new_arg = state.argumentCache.get(arg_id)
        if(state.argumentEditor){
          state.argumentEditor.setContents(new_arg?.delta)
        }
        return {
          breadCrumbs: breadCrumbs.concat(arg_id),
          nodes: new_arg?.nodes,
          edges: new_arg?.edges,
          highlights: new_arg?.highlights
        }
      })
      return true;
    } else {
      return false;
    }
  },

  /**
   * Saves the current argument state into the cache so it can be loaded later.
   */
  saveArgument: () => {
    if(get().breadCrumbs.length === 0){
      console.log("ERROR: No argument currently loaded.")
      return;
    }
    set((state) => {
      const curArgument = state.breadCrumbs[state.breadCrumbs.length - 1]
      const curDelta = state.argumentEditor ? state.argumentEditor.getContents() : {} as Delta;
      const newCache = new Map(state.argumentCache).set(curArgument, {
        nodes: state.nodes,
        edges: state.edges,
        highlights: state.highlights,
        delta: curDelta,
        name: state.name,
        id: curArgument
      })
      return {
        argumentCache: newCache
      }
    })
  },
  
  /**
   * Unloads current argument (saving current state in cache), and then loads
   * the desired argument.
   */
  switchArgument: (arg_id, breadCrumbs = []) => {
    get().saveArgument()
    return get().loadArgument(arg_id, breadCrumbs)
  },

  stepIntoArgument: (new_arg) => {
    return get().switchArgument(new_arg, get().breadCrumbs)
  },

  returnToArgument: (breadcrumb_index) => {
    return get().switchArgument(get().breadCrumbs[breadcrumb_index], get().breadCrumbs.slice(0, breadcrumb_index))
  },
}));
