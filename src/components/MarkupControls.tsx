// src/components/MarkupControls.tsx
import React, { useEffect, useState } from "react";
import { useStore } from "../lib/stateStore";

let claimCounter = 1;
let reasonCounter = 1;

export default function MarkupControls() {
  const text = useStore(state => state.text);
  const setText = useStore(state => state.setText);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    const check = () => {
      const sel = window.getSelection();
      setHasSelection(sel && sel.toString().trim().length > 0);
    };
    document.addEventListener("selectionchange", check);
    return () => document.removeEventListener("selectionchange", check);
  }, []);

  const wrapSelection = (tag: "claim" | "reason") => {
    const id = tag === "claim" ? `c${claimCounter++}` : `r${reasonCounter++}`;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.toString().trim()) return;

    const range = sel.getRangeAt(0);
    const wrapper = document.createElement(tag);
    wrapper.setAttribute("id", id);
    wrapper.textContent = range.toString();

    range.deleteContents();
    range.insertNode(wrapper);

    const editable = document.querySelector("[contenteditable]");
    if (editable) {
      const html = editable.innerHTML;
      const tagged = spanToTag(html);
      setText(tagged);
    }
  };

  const spanToTag = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll("span.highlight").forEach(span => {
      const ref = span.getAttribute("data-refid");
      const type = span.classList.contains("claim") ? "claim" : "reason";
      const tag = document.createElement(type);
      tag.setAttribute("id", ref || "");
      tag.innerHTML = span.innerHTML;
      span.replaceWith(tag);
    });
    return div.innerHTML;
  };

  return hasSelection ? (
    <div style={{ marginBottom: "0.5rem" }}>
      <button onClick={() => wrapSelection("claim")}>➕ Add Claim</button>{" "}
      <button onClick={() => wrapSelection("reason")}>➕ Add Reason</button>
    </div>
  ) : null;
}
