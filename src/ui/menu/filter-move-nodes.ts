/**
 * @param config 
 */
export function initSankeyNodeMovement(config: any) {
	const x = document.getElementById("xmove") as HTMLInputElement;
	const y = document.getElementById("ymove") as HTMLInputElement;
	if (x) {
		config.sankeyX = x.checked; 
		x.addEventListener("click", e => e.stopImmediatePropagation());
		x.addEventListener("input", () => config.sankeyX = x.checked);
	}
	if (y) {
		config.sankeyY = y.checked;
		y.addEventListener("click", e => e.stopImmediatePropagation());
		y.addEventListener("input", () => config.sankeyY = y.checked);
	}
}