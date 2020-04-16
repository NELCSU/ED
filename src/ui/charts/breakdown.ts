import { formatNumber } from "../../utils/format";
import { updatePie } from "../charts/pie";
import type { TBreak, TBreakChart, TConfig, TLink } from "../../typings/ED";

/**
 * @param config 
 */
export function initBreakdown(config: TConfig) {
  const body = document.querySelector("body") as HTMLBodyElement;

  const container = document.createElement("div");
  container.classList.add("breakdown", "left");
  container.style.opacity = "0";
  container.addEventListener("click", e => e.stopImmediatePropagation());
  body.appendChild(container);

  const close = document.createElement("div");
  close.classList.add("breakdown-close");
  close.addEventListener("click", (e) => {
    e.stopImmediatePropagation();
    hide(config);
  });
	container.appendChild(close);
		
  const text = document.createElement("div");
  text.classList.add("breakdown-message");
  container.appendChild(text);

  const chartContainer = document.createElement("div");
  chartContainer.classList.add("breakdown-charts");
  chartContainer.style.height = Math.min(config.chart.height - 100, config.chart.width) + "px";
  container.appendChild(chartContainer);

  const chart1 = document.createElement("div");
  chart1.classList.add("breakdown-primary");
  chart1.style.display = "none";
  chartContainer.appendChild(chart1);

  const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg1.style.height = "200px";
  svg1.style.width = "200px";
  chart1.appendChild(svg1);

  const chart2 = document.createElement("div");
  chart2.classList.add("breakdown-secondary");
  chart2.style.display = "none";
  chartContainer.appendChild(chart2);

  const svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg2.style.height = "200px";
  svg2.style.width = "200px";
  chart2.appendChild(svg2);		
  
  /**
   * @param config 
   */
	function hide (config: TConfig) {
		container.style.opacity = "0";
		container.style.zIndex = "-10";
		if (config.chart.highlighted) {
      config.chart.highlighted.style('opacity', config.filters.opacity.low);
      config.chart.highlighted = undefined;
    }
    svg1.innerHTML = "";
    svg2.innerHTML = "";
	}

  /**
   * @param d 
   */
	function show (d: TBreak) {
    if (d.x || d.y) {
      container.classList.remove("right");
      container.classList.remove("left");
      container.style.left = d.x + "px";
      container.style.top = d.y + "px";
    } else if (d.mouseX !== undefined && d.mouseX > window.innerWidth * 0.5) {			
      container.classList.remove("right");
      container.classList.add("left");
		} else {
			container.classList.add("right");
      container.classList.remove("left");
		}
		
		chartContainer.style.display = d.chart ? "" : "none";
		container.style.opacity = "1";
		container.style.zIndex = "10";
	
		text.innerHTML = `<table style="text-align:center;">${d.text}</table>`;
	}

  window.addEventListener("show-breakdown", (e: Event) => show((e as CustomEvent).detail));
  window.addEventListener("hide-breakdown", () => hide(config));
  window.addEventListener("link-breakdown", (e: Event) => displayLinkBreakdown((e as CustomEvent).detail.element, (e as CustomEvent).detail.data, config));
  window.addEventListener("node-breakdown", (e: Event) => displayNodeBreakdown((e as CustomEvent).detail.data, config));
}

/**
 * @param a 
 * @param d 
 * @param config
 */
function displayLinkBreakdown (a: Element, d: TLink, config: TConfig) {
	if (config.chart.highlighted) {
		config.chart.highlighted.style('opacity', config.filters.opacity.low);
	}

  // @ts-ignore
	d3.select(".breakdown-secondary")
		.style("display", "none");

	// @ts-ignore
	config.chart.highlighted = d3.select(a);
	config.chart.highlighted.style('opacity', config.filters.opacity.high);

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
		updatePie(d.supply, containerPrimary, d.source.name, d.target.name, d.value);
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
function displayNodeBreakdown(d: any, config: TConfig) {
	if (config.chart.highlighted) {
		config.chart.highlighted.style('opacity', config.filters.opacity.low);
	}

	config.chart.highlighted = config.chart.svg.selectAll(".link")
		.filter((l: TLink) => l.source === d || l.target === d);
	
	config.chart.highlighted?.transition()
    .style('opacity', config.filters.opacity.high);
    
	const nodesource: TBreakChart[] = [], nodetarget: TBreakChart[] = [];

	config.chart.svg.selectAll(".link")
		.filter((l: TLink) => l.target === d)[0]
			.forEach((l: TLink) => nodesource.push({ label: l.__data__.source.name, value: l.__data__.value }));

	config.chart.svg.selectAll(".link")
		.filter((l: TLink) => l.source === d)[0]
			.forEach((l: TLink) => nodetarget.push({ label: l.__data__.target.name, value: l.__data__.value }));

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
			updatePie(nodesource, containerPrimary, "Incoming", d.name, d3.sum(nodesource, function (d) { return d.value; }));
		} else {
			containerPrimary.style("display", "none");
			svgPrimary.style("display", "none");
		}
		// @ts-ignore
		if (nodetarget[0].label !== "None") {
			containerSecondary.style("display", null);
			svgSecondary.style("display", null);
			// @ts-ignore
			updatePie(nodetarget, containerSecondary, d.name, "Outgoing", d3.sum(nodetarget, function (d) { return d.value;	}));
		} else {
			containerSecondary.style("display", "none");
			svgSecondary.style("display", "none");
		}
	}, 500);

	const tipData: TBreak = {
		chart: true,
		// @ts-ignore
		mouseX: d3.event.sourceEvent ? d3.event.sourceEvent.pageX : d3.event.pageX,
		text: tiptext
  };
  
	window.dispatchEvent(new CustomEvent("show-breakdown", { detail: tipData }));
	window.dispatchEvent(new CustomEvent("hide-menu"));
}