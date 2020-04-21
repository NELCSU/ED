
import type { TConfig, TPoint } from "../../typings/ED";
import { event, select } from "d3-selection";
import { drag } from "d3-drag";
import { transition } from "d3-transition";

/**
 * @param config 
 */
export function initSankeyLegend(config: TConfig) {
	const leg = document.getElementById("Legend") as HTMLInputElement;
	leg.addEventListener("input", () => leg.checked ? show() : hide());

	config.legend.move.x = config.chart.width;
	config.legend.move.y = 10;

	window.addEventListener("show-legend", () => {
		if (!leg.checked) { return; }
		show();
	});

	function hide() {
		const svg = select("#chart > svg");
		svg.select(".chart-legend")
			.transition()
			.style("opacity", 0)
			.transition()
			.remove();
	}

	function show() {
		const svg = select("#chart > svg");
		const legend = svg.append("g")
			.datum({ x: config.legend.move.x, y: config.legend.move.y })
			.style("opacity", 0)
			.classed("chart-legend", true)
			.attr("transform", (d: TPoint) => `translate(${[d.x, d.y]})`);

		const t = transition()
			.duration(500);

		legend.transition(t as any).style("opacity", 1);

		legend.call(drag()
			// @ts-ignore
			.on("drag", function (this: Element, d: TPoint) {
				d.x += event.dx;
				d.y += event.dy;
				select(this)
					.attr("transform", (d: any) => `translate(${[d.x, d.y]})`);
			})
			.on("end", (d: TPoint) => {
				config.legend.move.x = d.x;
				config.legend.move.y = d.y;
			})
		);

		legend.append("rect")
			.attr("width", "200px")
			.attr("height", "140px")
			.attr("x", 0)
			.attr("y", 0)
			.classed("chart-legend", true);

		config.legend.colors.forEach((item: string, n: number) => {
			const g = legend.append("g")
				.style("transform", `translate(10px, ${20 + (25 * n)}px)`);

			g.append("circle")
				.style("fill", item)
				.style("opacity", config.filters.opacity.high)
				.attr("r", 10)
				.attr("cx", 10)
				.attr("cy", 10 + (1 * n));

			g.append("text")
				.classed("chart-legend", true)
				.attr("x", 25)
				.attr("y", 15 + (1 * n))
				.text(config.legend.labels[n]);
		});
	}
}