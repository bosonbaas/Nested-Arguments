import { useRef, useState } from "react";
import Editor from "./Editor"
import { useArgStore } from "../lib/stateStore";
import type Quill from "quill";
//import "./index.css";

export default function EditorContainer() {

  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill>(null);
  const highlights = useArgStore((state) => state.highlights)
  const addNode = useArgStore((state) => state.addNode)
  const addHighlight = useArgStore((state) => state.addHighlight)
  const setHover = useArgStore((state) => state.setHover)
  const setArgumentEditor = useArgStore((state) => state.setArgumentEditor)

  return (
    <div className="highlight-app">
      <Editor
        //@ts-ignore
        ref={quillRef}
        //@ts-ignore
        highlights={highlights}
        addHighlight={addHighlight}
        addNode={addNode}
        setHover={setHover}
        setArgumentEditor={setArgumentEditor}
      />
    </div>
  );
}