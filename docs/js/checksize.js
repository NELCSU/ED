function checksize() {
  var titlebar = document.getElementById("titlebar-right");
  if (titlebar) {
    titlebar.style.display = window.innerWidth < 1000 ? "none" : "inline";
  }
  
  if (window.innerWidth < 800 || window.innerHeight < 600) {
    alert("The recommended minimum resolution is 800 x 600.\n Yours is " + window.innerWidth + " x " + window.innerHeight + ".");
  }

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