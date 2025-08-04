// src/components/MarkupControls.tsx
import { useEffect, useState } from "react";
import { useStore } from "../lib/stateStore";

export default function MarkupControls() {
  const text = useStore(state => state.text);
  const setText = useStore(state => state.setText);
  const addNode = useStore(state => state.addNode);
  const id_ind = useStore(state => state.id_ind)
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    const check = () => {
      const sel = window.getSelection();
      setHasSelection(sel && sel.toString().trim().length > 0);
    };
    document.addEventListener("selectionchange", check);
    return () => document.removeEventListener("selectionchange", check);
  }, []);

  const addSelection = (tag: "claim" | "reason") => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.toString().trim()) return;
    const [id, range] = wrapSelection(sel, tag)
    addNode(range, tag, id)
  }

  // Converts <claim id="c1">text</claim> into styled <span> for editing
  const wrapSelection = (sel : any, tag: "claim" | "reason") => {
    
    const id = tag === "claim" ? `c${id_ind}` : `r${id_ind}`;

    //sel.rangeCount > 1 could enable people to include multiple pieces in the same claim/reason

    const range = sel.getRangeAt(0);
    const wrapper = document.createElement(tag);
    wrapper.setAttribute("id", id);
    wrapper.textContent = range.toString();

    range.deleteContents();
    range.insertNode(wrapper);

    // inserts a "claim" or "reason" span

    const panel = document.getElementById("argument_pane");
    if (panel) {
      const html = panel.innerHTML;
      const tagged = spanToTag(html);
      setText(tagged);
    }
    return [id, range.toString()];
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
      <button onClick={() => addSelection("claim")}>➕ Add Claim</button>{" "}
      <button onClick={() => addSelection("reason")}>➕ Add Reason</button>
    </div>
  ) : null;
}
