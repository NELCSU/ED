import { formatNumber } from "../../utils/format";
import type { D3Selection, TBreakdown } from "../../typings/ED";

/**
 * @param data 
 * @param placeholder 
 * @param placelabel1 
 * @param placelabel2 
 * @param pievalue 
 */
export function updatePie(data: TBreakdown[], placeholder: D3Selection, placelabel1: string, placelabel2: string, pievalue: number) {
	// @ts-ignore
	nv.addGraph(function () {
		// @ts-ignore
		const chart = nv.models.pieChart()
			// @ts-ignore
			.x(function (d) { return d.label; })
			// @ts-ignore
			.y(function (d) { return d.value; })
			.showLabels(true) //Display pie labels
			.labelThreshold(0.05) //Configure the minimum slice size for labels to show up
			.labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
			.donut(true) //Turn on Donut mode.
			.donutRatio(0.35); //Configure how big you want the donut hole size to be.

		const svg =	placeholder.select("svg");
		svg.selectAll(".centerpielabel").remove();

		const cx = parseInt(placeholder.style("width")) / 2;
		const cy = parseInt(placeholder.style("height")) / 2 + 20;

		svg.datum(data).transition().duration(350).call(chart);

		svg.append("text")
			.transition().duration(400)
			.attr("x", cx)
			.attr("y", cy - 10)
			.attr("class", "centerpielabel")
			.text(placelabel1);

		svg.append("text")
			.transition().duration(400)
			.attr("x", cx)
			.attr("y", cy + 4)
			.attr("class", "centerpielabel")
			.text(placelabel2);

		const pietext = formatNumber(pievalue);
		svg.append("text")
			.transition().duration(400)
			.attr("x", cx)
			.attr("y", cy + 18)
			.attr("class", "centerpielabel")
			.text(pietext);

		return chart;
	});
}