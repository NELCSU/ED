import type { TBreakdown } from "../../typings/ED";
import { select } from "d3-selection";
import { max, sum } from "d3-array";
import { scaleLinear, scaleBand } from "d3-scale";
import { axisBottom } from "d3-axis";
import { Slicer } from "@buckneri/js-lib-slicer";
import { svg } from "@buckneri/spline";

export function drawColumnChart(node: Element, data: TBreakdown[]) {
  const s = new Slicer(data.map(d => d.label));
  const total: number = Math.round(sum(data, (d: TBreakdown) => d.value));
  const fp: Intl.NumberFormat = (total === 1) 
    ? new Intl.NumberFormat("en-GB", { style: "percent" })
    : new Intl.NumberFormat("en-GB", { style: "decimal" });
  const margin = { top: 30, right: 10, bottom: 30, left: 20 };
  const width = node.clientWidth;
  const rw = width - margin.left - margin.right;
  const height = node.clientHeight;
  const rh = height - margin.top - margin.bottom;
  const x = scaleBand().range([0, rw]).padding(0.1) as any;
  const y = scaleLinear().range([rh, 0]) as any;

  const sg = select(svg(node as HTMLElement, { height: height, margin: margin, width: width}) as any);
  const canvas = sg.select(".canvas");

  sg.on("click", canvasClickHandler);

  x.domain(data.map((d: TBreakdown) => d.label));
  y.domain([0, max(data, (d: any) => d.value) * 1.1]);

  const xAxis = axisBottom(x)
    .tickValues(x.domain().filter((d: any, i: number) => data.length < 10 ? true : !(i % 3) || i === data.length - 1));

  const gAxis = canvas.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${rh})`)
    .call(xAxis);

  const ticks = gAxis.selectAll(".tick");
  const text = ticks.selectAll("text");
  
  text.each(function(this: SVGTextElement) {
    const t = select(this);
    const w = this.getBBox().width;
    if (w > x.bandwidth()) {
      const parent = select(this.parentNode as SVGGElement);

      parent.style("cursor", "pointer")
        .on("click", function(this: Element) {
          const tick = select(this);
          tick.style("cursor", null);
          tick.select("text")
            .text((d: any) => d);
          tick.on("click", null);
          tick.select("title").text((d: any) => d);
        });

      parent.append("title")
        .text((d: any) => `${d}\nClick to expand the text on this label`);

      t.text((d: any) => d.substring(0, Math.ceil(x.bandwidth() / 8)) + " ...");
    }
  } as any);

  const gbar = canvas.selectAll(".bar")
    .data(data).enter()
    .append("g")
      .attr("transform", (d: TBreakdown) => `translate(${x(d.label)},${y(d.value)})`);
  
  // @ts-ignore
  gbar.each((d, i, n) => n[i].addEventListener("click", (e: MouseEvent) => {
    barClickHandler(d, e);
  }));
  
  const rbar = gbar.append("rect")
    .attr("class", "bar")
    .attr("fill", (d: TBreakdown) => d.color ? d.color : "steelblue")
    .attr("x", 0)
    .attr("width", x.bandwidth())
    .attr("y", 0)
    .attr("height", (d: TBreakdown) => rh - y(d.value));

  rbar.append("title")
    .text((d: TBreakdown) => `${d.label}: ${fp.format(d.value)} calls`);

  gbar.append("text")
    .classed("bar", true)
    .attr("x", x.bandwidth() / 2)
    .attr("y", -2)
    .text((d: TBreakdown) => `${fp.format(d.value)}`);

  function barClickHandler(d: TBreakdown, event: MouseEvent) {
    event.stopImmediatePropagation();
    if (event.ctrlKey) {
      s.toggleCumulative(d.label);
    } else if (event.shiftKey) {
      s.toggleRange(d.label);
    } else {
      s.toggle(d.label);
    }
    highlight();
  }

  function canvasClickHandler() {
    s.clear();
    highlight();
  }

  function highlight() {
    gbar.each(function(this: SVGGElement, d: TBreakdown) {
      const filtered: boolean = s.isFiltered(d.label);
      return select(this).classed("filtered", filtered);
    });
  }
}