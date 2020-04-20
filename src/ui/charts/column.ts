import type { TBreakdown } from "../../typings/ED";
import { event, select } from "d3-selection";
import { max, sum } from "d3-array";
import { scaleLinear, scaleBand } from "d3-scale";
import { axisBottom } from "d3-axis";
import { format } from "d3-format";
import { Slicer } from "@buckneri/js-lib-slicer";

export function drawColumnChart(node: Element, data: TBreakdown[]) {
  const s = new Slicer(data.map(d => d.label));
  const total: number = sum(data, (d: TBreakdown) => d.value);
  const f =  (total === 100) ? format(".0%") : format(".0f");

  const container = select(node);
  const margin = { top: 30, right: 10, bottom: 35, left: 20 };
  const h = node.clientHeight;
  let w = node.clientWidth;
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  const x = scaleBand().range([0, width]).padding(0.1);
  const y = scaleLinear().range([height, 0]);

  const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  x.domain(data.map((d: TBreakdown) => d.label));
  y.domain([0, max(data, (d: any) => d.value)]);

  const xAxis = axisBottom(x)
    .tickValues(x.domain().filter((d, i) => !(i % 4)));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  const gbar = svg.selectAll(".bar")
    .data(data).enter()
    .append("g")
      .attr("transform", (d: TBreakdown) => `translate(${x(d.label)},${y(d.value)})`)
      .on("click", (d: TBreakdown) => {
        if (event.ctrlKey) {
          s.toggleCumulative(d.label);
        } else if (event.shiftKey) {
          s.toggleRange(d.label);
        } else {
          s.toggle(d.label);
        }
        gbar.each(function(this: SVGGElement, d: TBreakdown) {
          const filtered: boolean = s.isFiltered(d.label);
          return select(this).classed("filtered", filtered);
        });
      });

  const rbar = gbar.append("rect")
    .attr("class", "bar")
    .attr("fill", (d: TBreakdown) => d.color ? d.color : "steelblue")
    .attr("x", 0)
    .attr("width", x.bandwidth())
    .attr("y", 0)
    .attr("height", (d: TBreakdown) => height - y(d.value));

  rbar.append("title")
    .text((d: TBreakdown) => `${d.label}: ${f(d.value)} calls`);

  const tbar = gbar.append("text")
    .classed("bar", true)
    .attr("x", x.bandwidth() / 2)
    .attr("y", -2)
    .text((d: TBreakdown) => `${f(d.value)}`);
}