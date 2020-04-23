
import type { TConfig, TNode, TPoint } from "../../typings/ED";
import { event, select } from "d3-selection";
import { drag } from "d3-drag";
import { transition } from "d3-transition";
import { Delaunay } from "d3-delaunay";
import { polygonLength, polygonCentroid } from "d3-polygon";

/**
 * @param config 
 */
export function initSankeyLegend(config: TConfig) {
	const leg = document.getElementById("Legend") as HTMLInputElement;
	leg.addEventListener("input", () => leg.checked ? show() : hide());

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

	/**
	 * @link https://observablehq.com/@d3/voronoi-labels
	 */
	function show() {
		const svg = select("#chart > svg");
		const rh: number = config.legend.labels.length * 32;
		const rw: number = 150;

		// determine the least node dense area of chart
		let xy: number[][] = [];
		let nw = config.chart.sankey.nodeWidth() / 2;
		svg.selectAll("g.node").each((d: any) => {
			xy.push([d.x + nw, d.y + (d.dy / 2)] as any);
		});
		const delaunay = Delaunay.from(xy);
		const voronoi = delaunay.voronoi([-1, -1, config.chart.width + 1, config.chart.height + 1]);
		const cells: any[] = xy.map((d, i) => [d, voronoi.cellPolygon(i)]);
		let box: any, area = 0;
		cells.forEach((cell: any) => {
			const a = polygonLength(cell[1]);
			if (a > area) {
				area = a;
				box = cell[1];
			}
		});
		let [x, y] = polygonCentroid(box);
		x = x > config.chart.width / 2 ? config.chart.width - rw : 0;
		y = y > config.chart.height / 2 ? config.chart.height - rh : 0;
		//

		const legend = svg.append("g")
			.datum({ x: x, y: y })
			.style("opacity", 0)
			.classed("chart-legend", true);

		/* DEBUG
		svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "#900")
      .attr("d", voronoi.render());

 		svg.append("path")
      .attr("d", delaunay.renderPoints(undefined, 2));*/

		const t = transition()
			.duration(500);

		legend.transition(t as any).style("opacity", 1);

		function dragged(d: TPoint) {
			d.x += event.dx;
			d.y += event.dy;
			legend.attr("transform", (d: any) => `translate(${[d.x, d.y]})`);
		}
		// @ts-ignore
		legend.call(drag().on("drag", dragged));

		legend.append("rect")
			.attr("width", rw + "px")
			.attr("height", rh + "px")
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

		legend.attr("transform", (d: TPoint) => `translate(${[x, y]})`);
	}
}