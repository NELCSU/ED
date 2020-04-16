/**
 * @param config 
 */
export function initOpacitySlider(config: any) {
	config.filters.lowopacity = 0.3;
	config.filters.highopacity = 0.9;
	const opacity = document.getElementById("Opacity") as HTMLInputElement;
	opacity.addEventListener("change", (e: any) => {
		config.filters.lowopacity = e.target.value;
		window.dispatchEvent(new CustomEvent("filter-action"));
	});
}