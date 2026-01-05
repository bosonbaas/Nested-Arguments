import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Node, NodeType, Highlight } from '../lib/stateStore'
import Quill from "quill";
import katex from 'katex';
// @ts-ignore
import { registerHighlightFormat, setupHoverListeners, updateHoverFromState } from "../plugins/quillHighlightPlugin";
// @ts-ignore
import 'katex/dist/katex.min.css';
// @ts-ignore
import '../styles/QuillStyles.css';
// @ts-ignore
import 'quill/dist/quill.snow.css'
// @ts-ignore
window.katex = katex;

// Register the highlight format once at module load
registerHighlightFormat();

// TODO: Probably want to pull these straight from the Zustand Store instead
// of passing them in as components (?)
type EditorProps = {
  highlights: Highlight[];
  addHighlight: (type: NodeType, node_id: string) => string;
  addNode: (text: string, node_type: NodeType) => string;
  setHover: (id:string, state:boolean) => void;
  setArgumentEditor: (argumentEditor: Quill) => void;
  defaultValue: string;
  ref: RefObject<Quill>;
}

// Editor is an uncontrolled React component
export default function Editor({highlights, addHighlight, addNode, setHover, setArgumentEditor, defaultValue, ref}:EditorProps){
  
  // Why am I making these refs? This is carryover from
  // https://quilljs.com/playground/react
  const containerRef = useRef<HTMLDivElement>(null);
  const setHoverRef = useRef(setHover);
  const defaultValueRef = useRef(defaultValue);
  const addHighlightRef = useRef(addHighlight);
  const addNodeRef = useRef(addNode);
  const setArgumentEditorRef = useRef(setArgumentEditor);
  
  function highlightToID(hl: Highlight){
    return `${hl.type}_${hl.node_id}`
  }

  useEffect(() => {
    // Sync hover state to visual display
    const hoveredState = highlights.reduce((hs:any, hl) => {
      hs[highlightToID(hl)] = hl.hover;
      return hs;
    }, {})
    updateHoverFromState(highlights.map(highlightToID), hoveredState)
  }, [highlights])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return;

    // Construct custom toolbar
    // Create toolbar HTML
    // TODO: Update highlight button should only appear if a node is currently
    // selected
    const toolbarHtml = `
      <button class="ql-bold" title="Bold"></button>
      <button class="ql-italic" title="Italic"></button>
      <button class="ql-underline" title="Underline"></button>
      <button class="ql-formula" title="Underline"></button>
      <button class="ql-hl-claim-btn" title="Add Claim">Cl</button>
      <button class="ql-hl-reason-btn" title="Add Reason">R</button>
      <button class="ql-hl-comment-btn" title="Add Comment">Co</button>
      <button class="ql-hl-rebuttal-btn" title="Add Rebuttal">R</button>
      <button class="ql-hl-update-btn" title="Update Highlight">UH</button>
    `;
    const toolbar = container.ownerDocument.createElement('div')
    toolbar.id = "toolbar"
    toolbar.classList.add("ql-toolbar", "ql-snow")
    toolbar.innerHTML = toolbarHtml;

    // Construct editor
    const editor = container.ownerDocument.createElement('div')
    editor.classList.add("ql-container", "ql-snow")

    // Add to the editor container
    const toolbarContainer = container.appendChild(toolbar)
    const editorContainer = container.appendChild(editor)

    function handleHighlight(quill: Quill, type: NodeType){
      const range = quill.getSelection();
      console.log(quill.getSelection())
      if (range) {
        // Might need to adjust this a little to support math formulae
        // Will use quill.getContent(range.index, range.length)
        // This gives a delt which can then be used to setContent in another quill instance
        const text = quill.getText(range.index, range.length)
        console.log(text)
        const nodeId = addNodeRef?.current(text, type)
        addHighlightRef?.current(type, nodeId)

        // using nodeId to determine hover behavior
        // We may want to change this if we want users to be able
        // to delete a single highlight associated with a node.
        // Could do this by passing in a uid of `${nodeId}-${highlightId}`,
        // and then parsing it into two class names on the plugin side.
        quill.format('highlight', `${type}_${nodeId}`);
      } else {
        const nodeId = addNodeRef?.current(`Empty {type}`, type)
      }
    }

    // Create Quill instance
    const quill = new Quill(editorContainer, {
      theme: "snow",
      modules: {
        toolbar: {
          container: toolbarContainer,
          handlers: {
            'hl-claim-btn': (function(this: any) { // Match the class name 'ql-hl-claim-btn' (minus 'ql-')
                handleHighlight(this.quill, "claim")
            }),
            'hl-reason-btn': (function(this: any) { // Match the class name 'ql-hl-claim-btn' (minus 'ql-')
                handleHighlight(this.quill, "reason")
            }),
            'hl-comment-btn': (function(this: any) { // Match the class name 'ql-hl-claim-btn' (minus 'ql-')
                handleHighlight(this.quill, "comment")
            }),
            'hl-rebuttal-btn': (function(this: any) { // Match the class name 'ql-hl-claim-btn' (minus 'ql-')
                handleHighlight(this.quill, "rebuttal")
            }),
            'hl-update-btn': (function(this: any) { // Match the class name 'ql-hl-claim-btn' (minus 'ql-')
                handleHighlight(this.quill, "claim")
            })
          }
        }
      },
    });

    ref.current = quill;
    setArgumentEditorRef.current(quill);
    // @ts-ignore
    window.quill = quill;

    // Set initial content with pre-highlighted text
    if (defaultValueRef.current) {
      quill.setContents(defaultValueRef.current);
    }

    // Setup hover listeners. This only has to be run once
    // since the MutationObserver will handle adding new listeners
    setupHoverListeners(quill, (id:string, hover:boolean) => {
      // TODO: Maybe the coloring logic should all be moved into the plugin
      setHoverRef?.current(id.split("_")[1], hover);
    });

    return () => {
      quill?.disable();
      editor?.remove();
      toolbar?.remove();
    };
  }, [ref]);

  return <div ref={containerRef}></div>;
}