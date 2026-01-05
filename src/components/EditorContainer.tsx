import { useRef, useState } from "react";
import Editor from "./Editor"
import { useArgStore } from "../lib/stateStore";
import type Quill from "quill";
//import "./index.css";


const defaultValue = [
      {
        insert: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut ",
      },
      {
        insert: "labore et dolore magna aliqua.",
        attributes: {
          highlight: "a",
        },
      },
      {
        insert: " Ut enim ad minim veniam, ",
      },
      {
        insert: "quis nostrud exercitation",
        attributes: {
          highlight: "b",
        },
      },
      {
        insert: " ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum\n",
      },
    ]

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
      <h1>Highlighter App with Quill</h1>
      <Editor
        //@ts-ignore
        ref={quillRef}
        //@ts-ignore
        defaultValue={defaultValue}
        highlights={highlights}
        addHighlight={addHighlight}
        addNode={addNode}
        setHover={setHover}
        setArgumentEditor={setArgumentEditor}
      />
    </div>
  );
}