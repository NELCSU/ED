import { sankeyModel } from "./sankey-model";
import { formatNumber } from "../../utils/format";
import type { D3Selection, TBreakdown, TConfig, TMargin, TNode, TLink } from "../../typings/ED";
import { rgb } from "d3-color";
import { event, select } from "d3-selection";
import { sum } from "d3-array";
import { drag } from "d3-drag";
import { svg } from "../../utils/d3-utils";
import { transition } from "d3";

/**
 * @param config 
 */
export function initSankeyChart(config: TConfig) {
  const chart = document.getElementById("chart") as HTMLDivElement;
  const w = chart.clientWidth;
  const h = chart.clientHeight;

  select(chart).call(
    svg().height(h).width(w).margin(sankeyModel().margin())
  );

  window.addEventListener("sankey-chart", () => loadSankeyChart(config));
  window.addEventListener("clear-chart", () => {
    if (config.sankey.select()) {
      config.sankey.select().transition().style("opacity", config.filters.opacity.low);
    }
    config.sankey.clear();
  });
}

export function loadSankeyChart(config: TConfig) {
  const sg = select("#chart > svg");
  const chart = document.getElementById("chart") as HTMLDivElement;
  const w: number = chart.clientWidth;
  const h: number = chart.clientHeight;
  const m: TMargin = sankeyModel().margin();
  
  const canvas = sg.select("g.canvas");

  canvas.selectAll("g").remove();

  config.sankey = sankeyModel()
    .alignHorizontal()
    .nodeWidth(30)
    .nodePadding(config.filters.density)
    .size([w - m.left - m.right, h - m.top - m.bottom]);

  config.sankey.nodes(config.db.sankey.nodes)
    .links(config.db.sankey.links)
    .layout(32);

  const linkCollection = canvas.append("g")
    .selectAll(".link")
    .data(config.db.sankey.links)
    .enter()
    .append("g")
      .attr("class", "link");

  const path = config.sankey.reversibleLink();
  let p: D3Selection, f: D3Selection, e: D3Selection;
  if (path) {
    p = linkCollection.append("path")
      .attr("d", path(0));
    f = linkCollection.append("path")
      .attr("d", path(1));
    e = linkCollection.append("path")
      .attr("d", path(2));
  }

  linkCollection
    .attr("fill", (i: TLink) => i.fill ? i.fill : i.source.fill)
    .style("opacity", config.filters.opacity.low)
    .on("click", function (this: Element, d: TLink) {
      event.stopPropagation();

      if (config.sankey.select()) {
        config.sankey.select().transition().style("opacity", config.filters.opacity.low);
      }
      config.sankey.select(this);
      config.sankey.select().transition().style("opacity", config.filters.opacity.high);

      let text = `<p>${d.source.name} → ${d.target.name} calls</p>`;
      text += `<p>Outgoing: ${formatNumber(d.value)} calls</p>`;
  
      config.breakdown.message = text;
      config.breakdown.chart1 = d.supply;
      config.breakdown.chart2 = [];

      window.dispatchEvent(new CustomEvent("show-breakdown"));
    });

  const nodeCollection = canvas.append("g")
    .selectAll(".node")
    .data(config.db.sankey.nodes)
    .enter()
    .append("g")
      .attr("class", "node")
      .attr("transform", (i: TNode) => `translate(${i.x},${i.y})`)
      .call(drag()
        .clickDistance(1)
        // @ts-ignore
        .on("drag", function (this: SVGGElement, d: TNode) {
          if (config.filters.move.y) {
            if (config.filters.move.x) {
              select(this)
                .attr("transform", "translate(" + (d.x = Math.max(0, Math.min(w - d.dx, event.x))) + "," + (d.y = Math.max(0, Math.min(h - d.dy, event.y))) + ")");
            } else {
              select(this)
                .attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(h - d.dy, event.y))) + ")");
            }
          } else {
            if (config.filters.move.x) {
              select(this)
                .attr("transform", "translate(" + (d.x = Math.max(0, Math.min(w - d.dx, event.x))) + "," + d.y + ")");
            }
          }
          config.sankey.relayout();
          const path = config.sankey.reversibleLink();
      
          if (path) {
            f.attr("d", path(1));
            p.attr("d", path(0));
            e.attr("d", path(2));
          }
        })
      );

  nodeCollection.on("click", function (this: SVGGElement, d: TNode) {
    event.stopPropagation();
    
    if (config.sankey.select()) {
      config.sankey.select().transition().style("opacity", config.filters.opacity.low);
    }
    config.sankey.select(this);
    config.sankey.select().transition().style("opacity", config.filters.opacity.high);
      
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
      sg.selectAll(".link")
        // @ts-ignore
        .filter((l: TLink) => l.target === d)[0]
          .forEach((l: TLink) => nodesource.push({
            color: "steelblue",
            label: l.__data__.source.name, 
            value: l.__data__.value
          }));
  
      sg.selectAll(".link")
          // @ts-ignore
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
    .attr("width", config.sankey.nodeWidth())
    .style("fill", (d: TNode) => d.fill)
    // @ts-ignore
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
    .filter((i: TNode) => i.x < w / 2)
      .attr("x", 6 + config.sankey.nodeWidth())
      .attr("text-anchor", "start");

  nodeCollection.append("text")
    .classed("node-label", true)
    .attr("x", function (i: TNode) { return -i.dy / 2; })
    .attr("y", function (i: TNode) { return i.dx / 2 + 6; })
    .attr("transform", "rotate(270)")
    // @ts-ignore
    .text((i: TNode) => {
      if (i.dy > 50) {
        return formatNumber(i.value);
      }
    });

  window.dispatchEvent(new CustomEvent("show-legend"));
}