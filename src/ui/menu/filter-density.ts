/**
 * @param config 
 */
export function initDensitySlider(config: any) {
	const density = document.getElementById("Density") as HTMLInputElement;
	config.filters.density = 5;
	density.addEventListener("change", (e: any) => {
		config.filters.density = e.target.value;
		window.dispatchEvent(new CustomEvent("filter-action"));
	});
}