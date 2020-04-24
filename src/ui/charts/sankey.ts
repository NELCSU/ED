import { formatNumber } from "../../utils/format";
import type { TBreakdown, TConfig, TMargin, TNode, TLink } from "../../typings/ED";
import { rgb } from "d3-color";
import { event, select, selectAll } from "d3-selection";
import { drag } from "d3-drag";
import { svg } from "../../utils/d3-utils";
import { sankey, sankeyLinkHorizontal } from "./sankey-model";

/**
 * @param config 
 */
export function initSankeyChart(config: TConfig) {
  const chart = document.getElementById("chart") as HTMLDivElement;
  const w: number = chart.clientWidth;
  const h: number = chart.clientHeight;
  const m: TMargin = { bottom: 20, left: 20, right: 20, top: 30 };

  let selected: any;

  function clear() {
    if (selected) {
      selected.classed("selected", false);      
      selected = undefined;
    }
  }

  config.sankey = sankey()
    .nodePadding(config.filters.density)
    // @ts-ignore
    .margin(m)
    .nodeWidth(30)
    .extent([[1, 1], [w - m.left - m.right, h - m.top - m.bottom]]);

  select(chart).call(
    svg()
      .height(chart.clientHeight)
      .width(chart.clientWidth)
      .margin(m)
  );
  window.addEventListener("sankey-chart", () => loadSankeyChart(config));
  window.addEventListener("clear-chart", () => { clear(); });
  window.addEventListener("select-chart", (e: any) => {
    clear();
    selected = e.detail;
    if (selected.classed("node")) {
      const dt = selected.datum();
      selectAll("g.link")
        .each((d: any, i: number, n: any) => {
          if (d.source === dt || d.target === dt) {
            select(n[i]).select("path").classed("selected", true);
          }
        });
      selected = selectAll(".selected");
    } else {
      selected.classed("selected", true);
    }
  });
}

export function loadSankeyChart(config: TConfig) {
  const sg = select("#chart > svg");
  const chart = document.getElementById("chart") as HTMLDivElement;
  const w: number = chart.clientWidth;
  const h: number = chart.clientHeight;
  
  const canvas = sg.select("g.canvas");
  canvas.selectAll("g").remove();

  let graph = config.sankey(config.db.sankey);

  const linkCollection = canvas.append("g")
    .selectAll("g")
    .data(graph.links)
    .enter()
    .append("g")
      .attr("class", "link");

  linkCollection
    .append("path")
      .classed("link", true)
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => d.fill ? d.fill : d.source.fill)
      .attr("stroke-opacity", config.filters.opacity.low)
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .attr("fill", "none")
      .on("click", linkclick as any)
      .append("title")
        .text((d: any) => `${d.source.name} -> ${d.target.name}`);

  const dragger: any =  drag()
    .clickDistance(1)
    .on("start", dragstart)
    .on("drag", dragmove as any)
    .on("end", dragend);

  const nodeCollection = canvas.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("g")
      .attr("class", "node")
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .call(dragger as any);

  nodeCollection.on("click", nodeclick as any);

  nodeCollection.append("rect")
    .classed("node", true)
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", (d: any) => d.y1 - d.y0)
    .attr("width", (d: any) => d.x1 - d.x0)
    .style("fill", (d: any) => d.fill)
    .style("stroke", (d: any) => rgb(d.fill).darker(2) as any)
    .append("title")
      .text((d: any) => `${d.name} (${formatNumber(d.value)})`);

  nodeCollection.append("text")
    .attr("class", (d: any) => `node-label-outer-${d.x0 > w / 2 ? "right" : "left"}`)
    .attr("x", (d: any) => d.x0 < (w / 2) ? (d.x1 - d.x0) + 6 : -6)
    .attr("y", (d: any) => (d.y1 - d.y0) / 2)
    .attr("dy", ".35em")
    .text((d: any) => d.name);

  nodeCollection.append("text")
    .attr("class", "node-label")
    .attr("x", (d: any) => -(d.y1 - d.y0) / 2)
    .attr("y", (d: any) => (d.x1 - d.x0) / 2)
    .attr("dy", ".35em")
    .text((d: any) => (d.y1 - d.y0) > 50 ? formatNumber(d.value) : "");

  window.dispatchEvent(new CustomEvent("show-legend"));

  function linkclick (this: Element, d: TLink) {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("clear-chart"));
    window.dispatchEvent(new CustomEvent("select-chart", { detail: select(this) }));

    let text = `<p>${d.source.name} → ${d.target.name} calls</p>`;
    text += `<p>Outgoing: ${formatNumber(d.value)} calls</p>`;

    config.breakdown.message = text;
    config.breakdown.chart1 = d.supply;
    config.breakdown.chart2 = [];

    window.dispatchEvent(new CustomEvent("show-breakdown"));
  }

  function nodeclick (this: SVGGElement, d: TNode) {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("clear-chart"));
    window.dispatchEvent(new CustomEvent("select-chart", { detail: select(this) }));
      
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
      let src = 0;
      let tgt = 0;
      sg.selectAll(".link")
        .each(function (link: TLink) {
          if (link.target === d) {
            nodesource.push({
              color: "steelblue",
              label: link.source.name, 
              value: link.value
            });
            src += link.value;
          } else if (link.source === d) {
            nodetarget.push({
              color: "steelblue",
              label: link.target.name,
              value: link.value
            });
            tgt += link.value;
          }
        } as any);

      text = `<p>${d.name}</p><p>Incoming: ${formatNumber(src)} calls</p>`;
      text += `<p>Outgoing: ${formatNumber(tgt)} calls</p>`;
      text += `Out/In: ${(src === 0 || tgt === 0) ? "---" : formatNumber(tgt / src)}`;
    }

    config.breakdown.message = text;
    config.breakdown.chart1 = nodesource;
    config.breakdown.chart2 = nodetarget;

    window.dispatchEvent(new CustomEvent("show-breakdown"));
  }

  function dragstart(d: any) {
    if (!d.__x) {
      d.__x = event.x;
    }
    if (!d.__y) {
      d.__y = event.y;
    }
    if (!d.__x0) {
      d.__x0 = d.x0;
    }
    if (!d.__y0) {
      d.__y0 = d.y0;
    }
    if (!d.__x1) {
      d.__x1 = d.x1;
    }
    if (!d.__y1) {
      d.__y1 = d.y1;
    }
  }
  
  function dragmove(this: SVGGElement, d: any) {
    select(this)
      .attr("transform", function (d: any) {
        const dx = event.x - d.__x;
        const dy = event.y - d.__y;

        if (config.filters.move.x) {
          d.x0 = d.__x0 + dx;
          d.x1 = d.__x1 + dx;
          if (d.x0 < 0) {
            d.x0 = 0;
            d.x1 = config.sankey.nodeWidth();
          }
          if (d.x1 > w) {
            d.x0 = w - config.sankey.nodeWidth();
            d.x1 = w;
          }
        }

        if (config.filters.move.y) {
          d.y0 = d.__y0 + dy;
          d.y1 = d.__y1 + dy;
          if (d.y0 < 0) {
            d.y0 = 0;
            d.y1 = d.__y1 - d.__y0;
          }
          if (d.y1 > h) {
            d.y0 = h - (d.__y1 - d.__y0);
            d.y1 = h;
          }
        }

        return `translate(${d.x0}, ${d.y0})`;
      });

    config.sankey.update(graph);
    selectAll("path.link")
      .attr("d", sankeyLinkHorizontal());
  }
  
  function dragend(d: any) {
    delete d.__x;
    delete d.__y;
    delete d.__x0;
    delete d.__x1;
    delete d.__y0;
    delete d.__y1;
  }
}
