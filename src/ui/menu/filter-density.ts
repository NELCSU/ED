import type { TDragdealerConstructor } from "../../typings/Dragdealer";

declare let Dragdealer: TDragdealerConstructor;

/**
 * @param config 
 */
export function initDensitySlider(config: any) {
	config.densityslider = new Dragdealer("pslider", {
		x: 0.5,
		steps: 5,
		snap: true,
		callback: a => {
			config.padding = config.paddingmultiplier * (1 - a) + 3;
			window.dispatchEvent(new CustomEvent("filter-action", { detail: config }));
		}
  });
  
	const el = document.getElementById("pslider") as HTMLDivElement;
	el.addEventListener("click", e => e.stopImmediatePropagation());
}