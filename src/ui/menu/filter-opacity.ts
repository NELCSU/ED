/**
 * @param config 
 */
export function initOpacitySlider(config: any) {
	const opacity = document.getElementById("Opacity") as HTMLInputElement;
	opacity.addEventListener("change", (e: any) => {
		config.filters.opacity.low = e.target.value;
		window.dispatchEvent(new CustomEvent("filter-action"));
	});
}