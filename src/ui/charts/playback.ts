import type { TConfig } from "../../typings/ED";

export function initPlayback(config: TConfig): void {
  const tip = document.createElement("div");
  tip.classList.add("tip");
  document.body.appendChild(tip);
  tip.innerHTML = `<div class="message"></div><div class="playback-pause">pause</div><progress class="playback" min="0" max="8" value="0"></progress>`;
  const m = tip.querySelector(".message") as HTMLElement;
  const ps = tip.querySelector(".playback-pause") as HTMLElement;
  const bar = tip.querySelector("progress") as HTMLProgressElement;
  let timer: any, barTimer: any;
  let restart: any;

  function run(nodes: any[]) {
    if (nodes.length === 0) {
      tip.style.opacity = "0";
      return;
    }
    const node = nodes.shift() as any;
    restart = nodes;

    const box: DOMRect = (node.dom as SVGElement).getBoundingClientRect();
    tip.style.left = (box.left  + box.width / 2) + "px";
    tip.style.top = (box.top + box.height / 2) + "px";
    m.innerHTML = node.story;
    ps.textContent = "pause";
    bar.value = 0;
    clearInterval(barTimer);
    tip.style.opacity = "1";

    timer = setTimeout(() => {
      tip.style.opacity = "0";
      run(restart);
    }, 8000);
    barTimer = setInterval(progressBar, 50);
  }

  function pause() {
    if (timer === null) {
      run(restart);
    } else {
      clearTimeout(timer);
      clearInterval(barTimer);
      ps.textContent = "resume";
      timer = null;
    }
  }

  function progressBar() {
    if (timer && bar.value < bar.max) {
      bar.value += 0.05;
    } else {
      clearInterval(barTimer);
      barTimer = null;
    }    
  }

  ps.addEventListener("click", pause);

  window.addEventListener("node-playback", (e: any) => {
    run(e.detail);
  });
}
