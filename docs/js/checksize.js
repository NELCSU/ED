(function checksize() {
  if (window.innerWidth < 1000) {
    document.getElementById("titlebar-right").style.display = "none";
  } else {
    document.getElementById("titlebar-right").style.display = "inline";
  }
  if ((window.innerWidth < 800) || (window.innerHeight < 600)) {
    alert("The recommended minimum resolution is 800 x 600.\n Yours is " + window.innerWidth + " x " + window.innerHeight + ".");
  }
  setTimeout(function () {
    d3.select("#loading").style("display", "none");
    d3.select("#content").style("visibility", "visible");
    d3.select("#content").transition().style("opacity", 1);
  }, 500);
})();