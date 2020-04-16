
import type { TConfig } from "../../typings/ED";
/**
 * @param config 
 */
export function initOpacitySlider(config: TConfig) {
	const opacity = document.getElementById("Opacity") as HTMLInputElement;
	opacity.addEventListener("change", (e: any) => {
		config.filters.opacity.low = e.target.value;
		window.dispatchEvent(new CustomEvent("filter-action"));
	});
}