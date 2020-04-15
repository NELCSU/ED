import type { TDragdealerConstructor } from "../../typings/Dragdealer";

declare let Dragdealer: TDragdealerConstructor;

/**
 * @param config 
 */
export function initOpacitySlider(config: any) {
	config.lowopacity = 0.3;
	config.highopacity = 0.7;

	new Dragdealer("oslider", {
		x: 0.25,
		steps: 5,
		snap: true,
		callback: a => {
			config.lowopacity = 0.1 + 0.8 * a;
			window.dispatchEvent(new CustomEvent("filter-action", { detail: config }));
		}
  });
  
	const el = document.getElementById("oslider") as HTMLDivElement;
	el.addEventListener("click", e => e.stopImmediatePropagation());
}