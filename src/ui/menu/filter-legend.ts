export function initSankeyLegend() {
	const leg = document.getElementById("uiLegend") as HTMLInputElement;
	if (leg) {
		leg.addEventListener("click", e => e.stopImmediatePropagation());

		leg.addEventListener("input", e => {
			e.stopImmediatePropagation();
			window.dispatchEvent(new CustomEvent(leg.checked ? "show-legend" : "hide-legend"));
		});
	}
}