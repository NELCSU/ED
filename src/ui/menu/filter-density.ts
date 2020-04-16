import type { TConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initDensitySlider(config: TConfig) {
	const density = document.getElementById("Density") as HTMLInputElement;
	config.filters.density = 5;
	density.addEventListener("change", (e: any) => {
		config.filters.density = e.target.value;
		window.dispatchEvent(new CustomEvent("filter-action"));
	});
}