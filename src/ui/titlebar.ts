/**
 * Renders title bar components
 */
export function initTitleBar() {
  const titlebar = document.getElementById("titlebar-right") as HTMLDivElement;

  const org = document.createElement("span") as HTMLSpanElement;
  org.id = "org-in-title";

  const day = document.createElement("span") as HTMLSpanElement;
  day.id = "day-in-title";

  const call = document.createElement("span") as HTMLSpanElement;
  call.id = "call-in-title";

  if (titlebar) {
    const parent = document.createElement("span") as HTMLSpanElement;
    parent.classList.add("pagetitle", "th-fg-color");
    titlebar.appendChild(parent);
    parent.appendChild(org);
    parent.appendChild(sep());
    parent.appendChild(day);
    parent.appendChild(sep());
    parent.appendChild(call);
  }

  window.addEventListener("org-selected", (e: any) => org.textContent = e.detail);
  window.addEventListener("day-selected", (e: any) => day.textContent = e.detail);
  window.addEventListener("call-selected", (e: any) => call.textContent = e.detail);

  function sep() {
    const sep = document.createElement("span") as HTMLSpanElement;
    sep.style.marginLeft = "5px";
    sep.style.marginRight = "5px";
    sep.textContent = "|";
    return sep;
  }
}