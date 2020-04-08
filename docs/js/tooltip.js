// @ts-ignore
var old;
// @ts-ignore
var tooltipdiv;

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
	tooltipdiv.transition()
		.delay(300)
		.duration(200)
		.style("opacity", 1)
		.style("z-index", 10);

	// @ts-ignore
	if (d != old) {
    // @ts-ignore
		tooltipdiv.html('<table style="text-align:center;">' + d + '</table>')
			// @ts-ignore
			.style("left", (d3.event.pageX + 30) + "px")
			// @ts-ignore
			.style("top", (d3.event.pageY - 30) + "px");
	}
};

function initTooltip() {
  // @ts-ignore
  tooltipdiv = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .on("mouseover", function () {
      // @ts-ignore
      tooltipdiv.transition()
        .delay(300)
        .duration(200)
        .style("opacity", 1)
        .style("z-index", 10);
    })
    .on("mouseout", function () {
      // @ts-ignore
      tooltipdiv.transition()
        .delay(300)
        .duration(200)
        .style("opacity", 0)
        .style("z-index", -10);
    })
    .on("click", function () {
      // @ts-ignore
      tooltipdiv.transition()
        .duration(200)
        .style("opacity", 0)
        .style("z-index", -10);
    })
    .attr("onmousewheel", "scrollsankey(event.wheelDelta)");

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