import { initUIThemes } from "./filter-theme";
import { initCallList } from "./filter-call";
import { initDensitySlider } from "./filter-density";
import { initOpacitySlider } from "./filter-opacity";
import { initSankeyLegend } from "./filter-legend";
import { initSankeyNodeMovement } from "./filter-move-nodes";

/**
 * @param config 
 */
export function initMenu(config: any) {
  const menu = document.querySelector(".panel-right") as HTMLDivElement;
  const menuButton = document.querySelector(".panel-right-control") as HTMLDivElement;

  if (menu && menuButton) {
    menuButton.addEventListener("click", e => {
      e.stopImmediatePropagation();
      menu.classList.toggle("ready");
      window.dispatchEvent(new CustomEvent("hide-tip", { detail: config }));
    });
  }

  initCallList(config);
  initDensitySlider(config);
  initOpacitySlider(config);
  initSankeyLegend();
  initSankeyNodeMovement(config);
  initUIThemes();

  window.addEventListener("hide-menu", () => menu.classList.add("ready"));
}