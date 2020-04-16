/**
 * @param config 
 */
export function initSankeyNodeMovement(config: any) {
	const x = document.getElementById("MoveX") as HTMLInputElement;
	const y = document.getElementById("MoveY") as HTMLInputElement;
	if (config.chart === undefined) {
		config.chart = {};
	}
	config.chart.moveX = true;
	config.chart.moveY = true;
	x.addEventListener("input", () => config.chart.moveX = x.checked);
	y.addEventListener("input", () => config.chart.moveY = y.checked);	
}