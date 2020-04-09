// @ts-ignore
var old;
// @ts-ignore
var tooltipdiv, tooltiptext, tooltipcharts;

/**
 * 
 * @param {string | undefined} d 
 */
function tiphide (d) {
  old = d;
  // @ts-ignore
	tooltipdiv.transition()
		.delay(300)
		.duration(200)
		.style("opacity", 0)
		.style("z-index", -10);
};

/**
 * 
 * @param {any} d 
 */
function tipshow (d) {
  // @ts-ignore
  if (d3.event.pageX > window.innerWidth * 0.5) {
    // @ts-ignore
    tooltipdiv.classed("right", false).classed("left", true);
  } else {
    // @ts-ignore
    tooltipdiv.classed("right", true).classed("left", false);
  }

  // @ts-ignore
	tooltipdiv.transition()
		.delay(300)
		.duration(200)
		.style("opacity", 1)
		.style("z-index", 10);

	// @ts-ignore
	if (d != old) {
    // @ts-ignore
		tooltiptext.html('<table style="text-align:center;">' + d + '</table>');
	}
};

function initTooltip() {
  // @ts-ignore
  tooltipdiv = d3.select("body")
    .append("div")
    .attr("class", "tooltip left")
    .style("opacity", 0)
    .on("click", function () {
      // @ts-ignore
      tooltipdiv.transition()
        .duration(200)
        .style("opacity", 0)
        .style("z-index", -10);
    });

  tooltiptext = tooltipdiv.append("div")
    .classed("tooltip message", true);

  tooltipcharts = tooltipdiv.append("div")
    .classed("tooltip charts", true);
   
  tooltipcharts.append("div")
    .classed("piechart primary", true)
    .append("svg")
      .style("width", "200px")
      .style("height", "200px");

  tooltipcharts.append("div")
    .classed("piechart secondary", true)
    .append("svg")
      .style("width", "200px")
      .style("height", "200px");

  window.addEventListener("show-tip", function(e) {
    // @ts-ignore
    tipshow(e.detail);
  });
  
  window.addEventListener("hide-tip", function(e) {
    // @ts-ignore
    tiphide(e.detail);
  });
}

initTooltip();