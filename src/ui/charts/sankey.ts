import { sankeyModel } from "./sankey-model";
import { formatNumber } from "../../utils/format";
import type { D3Selection, TBreakdown, TConfig, TNode, TLink } from "../../typings/ED";
import { rgb } from "d3-color";
import { event, select } from "d3-selection";
import { sum } from "d3-array";
import { drag } from "d3-drag";

/**
 * @param config 
 */
export function initSankeyChart(config: TConfig) {
  const chart = document.getElementById("chart");
  const m = config.chart.margin;
  if (chart) {
    config.chart.width = chart.clientWidth - m.left - m.right;
    config.chart.height = chart.clientHeight - m.bottom - 130;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
  svg.style.width = config.chart.width + m.left + m.right + "px";
  svg.style.height = config.chart.height + m.top + m.bottom + "px";
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.style.transform = "translate(" + m.left + "," + m.top + ")";
  svg.appendChild(g);
  chart?.appendChild(svg);
  config.chart.svg = select(svg);

  window.addEventListener("sankey-chart", () => loadSankeyChart(config));
}

export function loadSankeyChart(config: TConfig) {
  const svg = config.chart.svg;
  svg.selectAll("g").remove();

  config.chart.sankey = sankeyModel()
    .alignHorizontal()
    .nodeWidth(30)
    .nodePadding(config.filters.density)
    .size([config.chart.width, config.chart.height]);

  config.chart.sankey.nodes(config.db.sankey.nodes)
    .links(config.db.sankey.links)
    .layout(32);

  const linkCollection = svg.append("g")
    .selectAll(".link")
    .data(config.db.sankey.links)
    .enter()
    .append("g")
      .attr("class", "link");

  const path = config.chart.sankey.reversibleLink();
  let h: D3Selection, f: D3Selection, e: D3Selection;
  if (path) {
    h = linkCollection.append("path")
      .attr("d", path(0));
    f = linkCollection.append("path")
      .attr("d", path(1));
    e = linkCollection.append("path")
      .attr("d", path(2));
  }

  linkCollection.
    attr("fill", (i: TLink) => i.fill ? i.fill : i.source.fill)
    .attr("opacity", config.filters.opacity.low)
    .on("click", function (this: Element, d: TLink) {
      event.stopPropagation();

      if (config.chart.highlighted) {
        config.chart.highlighted.style('opacity', config.filters.opacity.low);
      }

      config.chart.highlighted = select(this);
      config.chart.highlighted.style('opacity', config.filters.opacity.high);

      let text = `<p>${d.source.name} → ${d.target.name} calls</p>`;
      text += `<p>Outgoing: ${formatNumber(d.value)} calls</p>`;
  
      config.breakdown.message = text;
      config.breakdown.chart1 = d.supply;
      config.breakdown.chart2 = [];

      window.dispatchEvent(new CustomEvent("show-breakdown"));
    });

  const nodeCollection = svg.append("g")
    .selectAll(".node")
    .data(config.db.sankey.nodes)
    .enter()
    .append("g")
      .attr("class", "node")
      .attr("transform", (i: TNode) => `translate(${i.x},${i.y})`)
      .call(drag()
        .clickDistance(1)
        .on("drag", function (this: SVGGElement, d: TNode, i: number) {
          if (config.filters.move.y) {
            if (config.filters.move.x) {
              select(this)
                .attr("transform", "translate(" + (d.x = Math.max(0, Math.min(config.chart.width - d.dx, event.x))) + "," + (d.y = Math.max(0, Math.min(config.chart.height - d.dy, event.y))) + ")");
            } else {
              select(this)
                .attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(config.chart.height - d.dy, event.y))) + ")");
            }
          } else {
            if (config.filters.move.x) {
              select(this)
                .attr("transform", "translate(" + (d.x = Math.max(0, Math.min(config.chart.width - d.dx, event.x))) + "," + d.y + ")");
            }
          }
          config.chart.sankey.relayout();
          const path = config.chart.sankey.reversibleLink();
      
          if (path) {
            f.attr("d", path(1));
            h.attr("d", path(0));
            e.attr("d", path(2));
          }
        } as any)
      );

  nodeCollection.on("click", function (this: SVGGElement, d: TNode) {
    event.stopPropagation();
    if (config.chart.highlighted) {
      config.chart.highlighted.style('opacity', config.filters.opacity.low);
    }
    config.chart.highlighted = config.chart.svg.selectAll(".link")
      .filter((l: TLink) => l.source === d || l.target === d);
    
    config.chart.highlighted?.transition()
      .style('opacity', config.filters.opacity.high);
      
    const nodesource: TBreakdown[] = [], nodetarget: TBreakdown[] = [];
    let text;

    if (d.grouping) {
      text = `<p>Breakdown for ${d.name}</p>`;
  
      config.breakdown.message = text;
      d.grouping.map((e: TBreakdown) => {
        nodesource.push({
          color: e.color ? e.color : "steelblue",
          label: e.label,
          value: e.value
        });
      });
    } else {       
      config.chart.svg.selectAll(".link")
        .filter((l: TLink) => l.target === d)[0]
          .forEach((l: TLink) => nodesource.push({
            color: "steelblue",
            label: l.__data__.source.name, 
            value: l.__data__.value
          }));
  
      config.chart.svg.selectAll(".link")
        .filter((l: TLink) => l.source === d)[0]
          .forEach((l: TLink) => nodetarget.push({
            color: "steelblue",
            label: l.__data__.target.name,
            value: l.__data__.value
          }));

      let src = sum(nodesource, d => d.value);
      let tgt = sum(nodetarget, d => d.value);

      text = `<p>${d.name}</p><p>Incoming: ${formatNumber(src)} calls</p>`;
      text += `<p>Outgoing: ${formatNumber(tgt)} calls</p>`;
      text += `Out/In: ${(src === 0 || tgt === 0) ? "---" : formatNumber(tgt / src)}`;
    }

    config.breakdown.message = text;
    config.breakdown.chart1 = nodesource;
    config.breakdown.chart2 = nodetarget;

    window.dispatchEvent(new CustomEvent("show-breakdown"));
  });

  nodeCollection.append("rect")
    .attr("height", (d: TNode) => d.dy)
    .attr("width", config.chart.sankey.nodeWidth())
    .style("fill", (d: TNode) => d.fill)
    .style("stroke", (d: TNode) => rgb(d.fill).darker(2))
    .append("title")
      .text((d: TNode) => d.name);

  nodeCollection.append("text")
    .classed("node-label-outer", true)
    .attr("x", -6)
    .attr("y", (i: TNode) => i.dy / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text((i: TNode) => i.name)
    .filter((i: TNode) => i.x < config.chart.width / 2)
      .attr("x", 6 + config.chart.sankey.nodeWidth())
      .attr("text-anchor", "start");

  nodeCollection.append("text")
    .classed("node-label", true)
    .attr("x", function (i: TNode) { return -i.dy / 2; })
    .attr("y", function (i: TNode) { return i.dx / 2 + 6; })
    .attr("transform", "rotate(270)")
    .text((i: TNode) => {
      if (i.dy > 50) {
        return formatNumber(i.value);
      }
    });

  window.dispatchEvent(new CustomEvent("show-legend"));
}