function checksize() {
  var titlebar = document.getElementById("titlebar-right");
  if (titlebar) {
    titlebar.style.display = window.innerWidth < 1000 ? "none" : "inline";
  }
  
  if (window.innerWidth < 800 || window.innerHeight < 600) {
    alert("The recommended minimum resolution is 800 x 600.\n Yours is " + window.innerWidth + " x " + window.innerHeight + ".");
  }

  // @ts-ignore
  var sizecorrection = Math.max(0, 220 - parseInt(window.innerWidth * 0.2));
  // @ts-ignore
  d3.select("#chart").style("width", document.getElementById("chart").offsetWidth - sizecorrection);
  // @ts-ignore
  d3.select("#titlebar").style("width", document.getElementById("titlebar").offsetWidth - sizecorrection);
  // @ts-ignore
  d3.select("#timeslider").style("width", document.getElementById("titlebar").offsetWidth);

  setTimeout(function () {
    var loading = document.getElementById("loading");
    if (loading) {
      loading.style.display = "none";
    }
    var content = document.getElementById("content");
    if (content) {
      content.style.visibility = "visible";
    }
    // @ts-ignore
    d3.select("#content").transition().style("opacity", 1);
  }, 500);
}

checksize();