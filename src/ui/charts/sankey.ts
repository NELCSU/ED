import { sankeyModel } from "./sankey-model";
import { formatNumber } from "../../utils/format";
import type { D3Selection, TConfig, TNode, TLink } from "../../typings/ED";

/**
 * @param config 
 */
export function initSankeyChart(config: TConfig) {
  const chart = document.getElementById("chart");
  if (chart) {
    config.chart.width = chart.offsetWidth - config.chart.margin.left - config.chart.margin.right;
    config.chart.height = chart.offsetHeight - config.chart.margin.bottom - 130;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
  svg.style.width = config.chart.width + config.chart.margin.left + config.chart.margin.right + "px";
  svg.style.height = config.chart.height + config.chart.margin.top + config.chart.margin.bottom + "px";
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.style.transform = "translate(" + config.chart.margin.left + "," + config.chart.margin.top + ")";
  svg.appendChild(g);
  chart?.appendChild(svg);
  // @ts-ignore
  config.chart.svg = d3.select(svg);

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
    .attr("class", "link")
    .sort((j: TLink, i: TLink) => i.dy - j.dy);

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
      // @ts-ignore
      d3.event.stopPropagation();
      window.dispatchEvent(new CustomEvent("link-breakdown", { detail: { element: this, data: d } }));
    });

  const nodeCollection = svg.append("g")
    .selectAll(".node")
    .data(config.db.sankey.nodes)
    .enter()
    .append("g")
      .attr("class", "node")
      .attr("transform", (i: TNode) => `translate(${i.x},${i.y})`)
      // @ts-ignore
      .call(d3.behavior.drag()
        .origin((i: TNode) => i)
        .on("dragstart", function (this: Element, d: TNode) {
          this.parentNode?.appendChild(this);
          // @ts-ignore
          d.initialPosition = d3.select(this).attr("transform");
        })
        .on("drag", dragged)
        .on("dragend", function (this: Element, d: TNode) {
          // @ts-ignore
          if (d.initialPosition === d3.select(this).attr("transform")) {
            window.dispatchEvent(new CustomEvent("node-breakdown", { detail: { element: this, data: d } }));
          }
        })
      );

  nodeCollection.append("rect")
    .attr("height", (i: TNode) => i.dy)
    .attr("width", config.chart.sankey.nodeWidth())
    .style("fill", (i: TNode) => i.color = i.fill)
    // @ts-ignore
    .style("stroke", (i: TNode) => d3.rgb(i.color).darker(2));

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

  function dragged(this: Element, i: TNode) {
    if (config.filters.move.y) {
      if (config.filters.move.x) {
        // @ts-ignore
        d3.select(this)
        // @ts-ignore
          .attr("transform", "translate(" + (i.x = Math.max(0, Math.min(config.chart.width - i.dx, d3.event.x))) + "," + (i.y = Math.max(0, Math.min(config.chart.height - i.dy, d3.event.y))) + ")");
      } else {
        // @ts-ignore
        d3.select(this)
        // @ts-ignore
          .attr("transform", "translate(" + i.x + "," + (i.y = Math.max(0, Math.min(config.chart.height - i.dy, d3.event.y))) + ")");
      }
    } else {
      if (config.filters.move.x) {
        // @ts-ignore
        d3.select(this)
        // @ts-ignore
          .attr("transform", "translate(" + (i.x = Math.max(0, Math.min(config.chart.width - i.dx, d3.event.x))) + "," + i.y + ")");
      }
    }
    config.chart.sankey.relayout();
    const path = config.chart.sankey.reversibleLink();

    if (path) {
      f.attr("d", path(1));
      h.attr("d", path(0));
      e.attr("d", path(2));
    }
  }
}