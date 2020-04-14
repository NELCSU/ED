/**
 * Renders title bar components
 */
export function initTitleBar() {
  const titlebar = document.getElementById("titlebar-right") as HTMLDivElement;

  const stp = document.createElement("span") as HTMLSpanElement;
  stp.id = "stp-in-title";

  const day = document.createElement("span") as HTMLSpanElement;
  day.id = "day-in-title";

  const call = document.createElement("span") as HTMLSpanElement;
  call.id = "call-in-title";
  if (titlebar) {
    const parent = document.createElement("span") as HTMLSpanElement;
    parent.classList.add("pagetitle", "th-fg-color");
    titlebar.appendChild(parent);
    parent.appendChild(stp);
    parent.appendChild(sep());
    parent.appendChild(day);
    parent.appendChild(sep());
    parent.appendChild(call);
  }

  window.addEventListener("stp-selection", (e: any) => stp.textContent = e.detail.text);

  window.addEventListener("day-selection", (e: any) => day.textContent = e.detail.text);

  window.addEventListener("call-selection", (e: any) => call.textContent = e.detail.text);

  function sep() {
    const sep = document.createElement("span") as HTMLSpanElement;
    sep.style.marginLeft = "5px";
    sep.style.marginRight = "5px";
    sep.textContent = "|";
    return sep;
  }
}