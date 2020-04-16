import { sankeyModel } from "./sankey-model";
import { formatNumber } from "../../utils/format";

/**
 * @param config 
 */
export function initSankeyChart(config: any) {
	if (config.chart === undefined) {
		config.chart = {};
	}
	config.chart.margin = {	top: 70, right: 10, bottom: 12, left: 40 };
  const chart = document.getElementById("chart");
  if (chart) {
    config.chart.width = chart.offsetWidth - config.chart.margin.left - config.chart.margin.right;
    config.chart.height = chart.offsetHeight - config.chart.margin.bottom - 130;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
  svg.style.width = config.chart.width + config.chart.margin.left + config.chart.margin.right;
  svg.style.height = config.chart.height + config.chart.margin.top + config.chart.margin.bottom;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.style.transform = "translate(" + config.chart.margin.left + "," + config.chart.margin.top + ")";
  svg.appendChild(g);
	chart?.appendChild(svg);
	// @ts-ignore
	config.chart.svg = d3.select(svg);
	
	window.addEventListener("sankey-chart", () => loadSankeyChart(config));
}

export function loadSankeyChart(config: any) {
	// @ts-ignore
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
      .sort(function (j: any, i: any) { return i.dy - j.dy;	});

  const path = config.chart.sankey.reversibleLink();
  let h: any, f: any, e: any;
  if (path) {
    h = linkCollection.append("path") //path0
      .attr("d", path(0));
    f = linkCollection.append("path") //path1
      .attr("d", path(1));
    e = linkCollection.append("path") //path2
      .attr("d", path(2));
  }

  linkCollection.attr("fill", function (i: any) { 
      return i.fill ? i.fill : i.source.fill; 
    })
    .attr("opacity", config.filters.lowopacity)
    .on("click", function (d: any) {
      // @ts-ignore
      d3.event.stopPropagation();
      // @ts-ignore
      displayLinkBreakdown(this, d, config); 
    });

  const nodeCollection = svg.append("g")
    .selectAll(".node")
    .data(config.db.sankey.nodes)
    .enter()
    .append("g")
      .attr("class", "node")
      .attr("transform", function (i: any) { return "translate(" + i.x + "," + i.y + ")"; })
      // @ts-ignore
      .call(d3.behavior.drag()
        .origin(function (i: any) { return i; })
        .on("dragstart", function (d: any) {
          // @ts-ignore
          this.parentNode.appendChild(this);
          // @ts-ignore
          d.initialPosition = d3.select(this).attr("transform");
        })
        .on("drag", dragged)
        .on("dragend", function(d: any) {
          // @ts-ignore
          if (d.initialPosition === d3.select(this).attr("transform")) {
            displayNodeBreakdown(d, config);
          }
        })
      );

  nodeCollection.append("rect")
    .attr("height", function (i: any) { return i.dy; })
    .attr("width", config.chart.sankey.nodeWidth())
    .style("fill", function (i: any) { return i.color = i.fill; })
    // @ts-ignore
    .style("stroke", function (i) {	return d3.rgb(i.color).darker(2);	});

  nodeCollection.append("text")
    .classed("node-label-outer", true)
    .attr("x", -6)
    .attr("y", function (i: any) {	return i.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function (i: any) { return i.name; })
    .filter(function (i: any) { return i.x < config.chart.width / 2; })
    .attr("x", 6 + config.chart.sankey.nodeWidth())
    .attr("text-anchor", "start");

  nodeCollection.append("text")
    .classed("node-label", true)
    .attr("x", function (i: any) {	return -i.dy / 2;	})
    .attr("y", function (i: any) {	return i.dx / 2 + 6; })
    .attr("transform", "rotate(270)")
    .text((i: any) => {
      if (i.dy > 50) {
        return formatNumber(i.value);
      }
    });

  window.dispatchEvent(new CustomEvent("show-legend"));
  
  function dragged(i: any) {
    if (config.chart.moveY) {
      if (config.chart.moveX) {
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
      if (config.chart.moveX) {
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

/**
 * @param a 
 * @param d 
 * @param config
 */
function displayLinkBreakdown (a: any, d: any, config: any) {
	if (config.chart.highlightedItem) {
		config.chart.highlightedItem.style('opacity', config.filters.lowopacity);
	}

  // @ts-ignore
	d3.select(".breakdown-secondary")
		.style("display", "none");

	// @ts-ignore
	config.chart.highlightedItem = d3.select(a);
	config.chart.highlightedItem.style('opacity', config.filters.highopacity);

	let tiptext = "<tr><td style='font-weight:bold;'>" + d.source.name;
	tiptext += "</td><td style='font-size:24px;'>→</td><td style='font-weight:bold;'>";
	tiptext += d.target.name + "</td></tr><tr><td>Calls</td><td>";
	tiptext += formatNumber(d.value) + "</td><td> Calls</td></tr>";
	
	// @ts-ignore
	const container = d3.select(".breakdown-charts");

	let h = parseInt(container.style("height"));
	let w = parseInt(container.style("width"));
	h = w = Math.max(h, w);

	const containerPrimary = container.select(".breakdown-primary");
	const svgPrimary = containerPrimary.select("svg");
	const containerSecondary = container.select(".breakdown-secondary");
	const svgSecondary = containerSecondary.select("svg");

	svgPrimary.style("height", h + "px").style("width", w + "px");
	svgSecondary.style("height", h + "px").style("width", w + "px");

	// @ts-ignore
	setTimeout(function () {
		containerPrimary.style("display", null);
		svgPrimary.style("display", null);
		containerSecondary.style("display", "none");
		svgSecondary.style("display", "none");
		// @ts-ignore
		updatepie(d.supply, containerPrimary, d.source.name, d.target.name, d.value);
	}, 500);

	const tipData = {
    chart: true,
    // @ts-ignore
		mouseX: d3.event.sourceEvent ? d3.event.sourceEvent.pageX : d3.event.pageX,
		text: tiptext
  };
  
	window.dispatchEvent(new CustomEvent("show-breakdown", { detail: tipData }));
	window.dispatchEvent(new CustomEvent("hide-menu"));
}

/**
 * @param d 
 * @param config
 */
function displayNodeBreakdown(d: any, config: any) {
	if (config.chart.highlightedItem) {
		config.chart.highlightedItem.style('opacity', config.filters.lowopacity);
	}

	config.chart.highlightedItem = config.chart.svg.selectAll(".link")
		// @ts-ignore
		.filter(function (l) { return l.source === d || l.target === d; });
	
	config.chart.highlightedItem.transition()
    .style('opacity', config.filters.highopacity);
    
	const nodesource: any[] = [], nodetarget: any[] = [];

	config.chart.svg.selectAll(".link")
		.filter((l: any) => l.target === d)[0]
			.forEach((l: any) => nodesource.push({ label: l.__data__.source.name, value: l.__data__.value }));

	config.chart.svg.selectAll(".link")
		.filter((l: any) => l.source === d)[0]
			.forEach((l: any) => nodetarget.push({ label: l.__data__.target.name, value: l.__data__.value }));

	if (nodesource.length === 0) {
		nodesource.push({ label: "None", value: 0 });
	}

	if (nodetarget.length === 0) {
		nodetarget.push({ label: "None", value: 0 });
	}

	let tiptext = "<tr><td colspan=2 style='font-weight:bold;'>" + d.name;
	tiptext += "</td></tr><tr><td>Incoming</td><td>";
	// @ts-ignore
	tiptext += formatNumber(d3.sum(nodesource, function (d) { return d.value; }));
	tiptext += " Calls</td></tr><tr><td>Outgoing</td><td>";
	// @ts-ignore
	tiptext += formatNumber(d3.sum(nodetarget, function (d) { return d.value; })) + " Calls</td></tr>";
	
	// @ts-ignore
	let outin = formatNumber(d3.sum(nodetarget, function (d) { return d.value; }) / d3.sum(nodesource, function (d) { return d.value; }));
	// @ts-ignore
	if ((d3.sum(nodesource, function (d) { return d.value; }) === 0) || 
			// @ts-ignore
			(d3.sum(nodetarget, function (d) { return d.value; }) === 0)) {
				outin = "--";
	}
	tiptext += "<tr><td>OUT / IN</td><td>" + outin + "</td></tr>";

	// @ts-ignore
	const container = d3.select(".breakdown-charts");

	let h = parseInt(container.style("height"));
	let w = parseInt(container.style("width"));
	h = w = Math.max(h, w);

	const containerPrimary = container.select(".breakdown-primary");
	const svgPrimary = containerPrimary.select("svg");
	const containerSecondary = container.select(".breakdown-secondary");
	const svgSecondary = containerSecondary.select("svg");

	if (nodesource[0].label !== "None" && nodetarget[0].label !== "None") {
		svgPrimary.style("height", (h / 2) + "px").style("width", w + "px");
		svgSecondary.style("height", (h / 2) + "px").style("width", w + "px");
	} else {
		svgPrimary.style("height", h + "px").style("width", w + "px");
		svgSecondary.style("height", h + "px").style("width", w + "px");
	}

	// @ts-ignore
	setTimeout(function () {
		// @ts-ignore
		if (nodesource[0].label !== "None") {
			containerPrimary.style("display", null);
			svgPrimary.style("display", null);
			// @ts-ignore
			updatepie(nodesource, containerPrimary, "Incoming", d.name, d3.sum(nodesource, function (d) { return d.value; }));
		} else {
			containerPrimary.style("display", "none");
			svgPrimary.style("display", "none");
		}
		// @ts-ignore
		if (nodetarget[0].label !== "None") {
			containerSecondary.style("display", null);
			svgSecondary.style("display", null);
			// @ts-ignore
			updatepie(nodetarget, containerSecondary, d.name, "Outgoing", d3.sum(nodetarget, function (d) { return d.value;	}));
		} else {
			containerSecondary.style("display", "none");
			svgSecondary.style("display", "none");
		}
	}, 500);

	const tipData = {
    chart: true,
    // @ts-ignore
		mouseX: d3.event.sourceEvent ? d3.event.sourceEvent.pageX : d3.event.pageX,
		text: tiptext
  };
  
	window.dispatchEvent(new CustomEvent("show-breakdown", { detail: tipData }));
	window.dispatchEvent(new CustomEvent("hide-menu"));
}

/**
 * @param data 
 * @param placeholder 
 * @param placelabel1 
 * @param placelabel2 
 * @param pievalue 
 */
function updatepie(data: any, placeholder: any, placelabel1: any, placelabel2: any, pievalue: any) {
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