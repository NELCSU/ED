import type { TConfig } from "../../typings/ED";

export function initPlayback(config: TConfig): void {
  const tip = document.querySelector("nel-tip") as any;

  function run(nodes: any[]) {
    if (nodes.length === 0) {
      tip.show = false;
      return;
    }
    const node = nodes.shift() as any;
    if ((node.dom as SVGElement).tagName === "g") {
      node.dom = node.dom.querySelector("rect");
    }
    tip.for = node.dom.id;
    tip.textContent = node.story;
    tip.show = true;
  }

  window.addEventListener("node-playback", (e: any) => {
    run(e.detail);
  });
}
