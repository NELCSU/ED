/**
 * @param config 
 */
export function initSankeyLegend(config: any) {
	const leg = document.getElementById("Legend") as HTMLInputElement;
	leg.addEventListener("input", e => leg.checked ? show() : hide());

	window.addEventListener("show-legend", () => {
		if (!leg.checked) { return; }
		show();
	});

	function hide() {
		// @ts-ignore
		const svg = d3.select("#chart > svg");
		svg.select(".chart-legend")
			.transition()
			.style("opacity", 0)
			.transition()
			.remove();
	}

	function show() {
		// @ts-ignore
		const svg = d3.select("#chart > svg");
		const legend = svg.append("g")
			.datum({ x: config.chart.width - 200, y: config.chart.height - 140 })
			.style("opacity", 0)
			.attr("x", function(d: any) { return d.x; })
			.attr("y", function(d: any) { return d.y; })
			.classed("chart-legend", true)
			.attr("transform", function (d: any) { return "translate(" + [ d.x,d.y ] + ")"; });

		legend.transition()
			.duration(500)
			.style("opacity", 1);

		// @ts-ignore
		legend.call(d3.behavior.drag()
			.on("drag", function (d: any) {
				// @ts-ignore
				d.x += d3.event.dx;
				// @ts-ignore
				d.y += d3.event.dy;	
				// @ts-ignore
				d3.select(this)
					.attr("transform", function(d: any) {
						return "translate(" + [ d.x, d.y ] + ")";
					});
			})
		);

		legend.append("rect")
			.attr("width", "200px")
			.attr("height", "140px")
			.attr("x", 0)
			.attr("y", 0)
			.classed("chart-legend", true);

		config.legend.colors.forEach((item: any, n: number) => {
			const g = legend.append("g")
				.style("transform", "translate(10px, " + (20 + (25 * n)) + "px)");

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