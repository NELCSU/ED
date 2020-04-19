import type { TBreakdown } from "../../typings/ED";

export function drawColumnChart(node: Element, data: TBreakdown[]) {
  // @ts-ignore
  const container = d3.select(node);
  const margin = { top: 20, right: 10, bottom: 35, left: 20 };
  const h = node.clientHeight;
  let w = node.clientWidth;
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  // @ts-ignore
  const x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

  // @ts-ignore
  const y = d3.scale.linear().range([height, 0]);

  // @ts-ignore
  const xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(6);

  const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map((d: TBreakdown) => d.label));

  // @ts-ignore
  y.domain([0, d3.max(data, (d) => d.value)]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.selectAll(".bar")
    .data(data).enter()
    .append("rect")
      .attr("class", "bar")
      .attr("fill", (d: TBreakdown) => d.color ? d.color : "steelblue")
      .attr("x", (d: TBreakdown) => x(d.label))
      .attr("width", x.rangeBand())
      .attr("y", (d: TBreakdown) => y(d.value))
      .attr("height", (d: TBreakdown) => height - y(d.value))
    .append("title")
      .text((d: TBreakdown) => `${d.label}: ${d.value} % calls`);
}