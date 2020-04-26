
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
		const canvas = svg.select(".canvas");
		canvas.select(".chart-legend")
			.transition()
			.style("opacity", 0)
			.transition()
			.remove();
	}

	/**
	 * @link https://observablehq.com/@d3/voronoi-labels
	 */
	function show() {
		const svg = document.querySelector("#chart > svg") as SVGSVGElement;
		const box: DOMRect = svg.getBoundingClientRect();
		const h = box.height;
		const w = box.width;
		const canvas = select(svg).select("g.canvas");
		const rh: number = config.legend.map(leg => leg.labels.length * 29).reduce((ac, le) => ac + le, 0);
		const rw: number = 150;
		const m = config.sankey.margin();
		const nw = config.sankey.nodeWidth() / 2;

		// determine the least node dense area of chart
		let xy: number[][] = [];
		const nodes = canvas.selectAll("g.node").data();
		nodes.forEach((d: any) => {
			xy.push([d.x1 - nw, d.y1 - (d.y0 / 2)] as any);
		});
		const delaunay = Delaunay.from(xy);
		const voronoi = delaunay.voronoi([-1, -1, w - m.left - m.right + 1, h - m.top - m.bottom + 1]);
		const cells: any[] = xy.map((d, i) => [d, voronoi.cellPolygon(i)]);
		let bx: any, area = 0;
		cells.forEach((cell: any) => {
			try {
				const a = polygonLength(cell[1]);
				if (a > area) {
					area = a;
					bx = cell[1];
				}
			} catch {}
		});
		let [x, y] = polygonCentroid(bx);
		x = x > w / 2 ? w - rw - m.right : 0 + m.left;
		y = y > h / 2 ? h - rh - m.bottom : 0 + m.top;
		//

		const legend = canvas.append("g")
			.datum({ x: x, y: y })
			.style("opacity", 0)
			.classed("chart-legend", true);

		/*// DEBUG
		canvas.append("path").attr("fill", "none").attr("stroke", "#900").attr("d", voronoi.render());
		canvas.append("path").attr("d", delaunay.renderPoints(undefined, 2));*/

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

		const rect = legend.append("rect")
			.attr("width", rw + "px")
			.attr("height", rh + "px")
			.attr("x", 0)
			.attr("y", 0)
			.classed("chart-legend", true);

		legend.append("text")
			.attr("x", rw / 2)
			.attr("y", 15)
			.attr("text-anchor", "middle")
			.text("legend");

		const resize = legend.append("text")
			.attr("class", "legend-resize")
			.attr("x", rw - 15)
			.attr("y", 15)
			.text("⤢")
			.on("click", resizeHandler);

		resize.append("title")
			.text("Sho/hide legend");

		let accum = 0;
		config.legend.forEach((leg: any) => {
			leg.colors.forEach((item: string, m: number) => {
				const g = legend.append("g")
					.style("transform", `translate(10px, ${28 + (25 * accum)}px)`);
	
				g.append("circle")
					.style("fill", item)
					.attr("r", 7)
					.attr("cx", 7)
					.attr("cy", 2 + (1 * accum));
	
				g.append("text")
					.classed("chart-legend", true)
					.attr("x", 22)
					.attr("y", 8 + (1 * accum))
					.text(leg.labels[m]);

				++accum;
			});
		});

		function resizeHandler() {
			if (legend.classed("ready")) {
				legend.classed("ready", false);
				legend.selectAll("g")
					.transition().duration(200).delay(400)
					.style("opacity", null);
				rect
					.transition().duration(500)
					.attr("height", rh + "px");
			} else {
				legend.classed("ready", true);
				legend.selectAll("g")
					.transition().duration(300)
					.style("opacity", 0);
				rect
					.transition().duration(500)
					.attr("height", "20px");
			}
		}

		legend.attr("transform", (d: TPoint) => `translate(${[x, y]})`);
	}
}