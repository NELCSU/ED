/*This software is released under the MIT License

Copyright (C) 2014 Denes Csala http://www.csaladen.es

This website accompanies the research paper entitled
Food and Energy in the Global Sustainable Energy Transition:
An Energy Metabolism View of Global Agriculture Systems
by Sgouris Sgouridis & Denes Csala

The following software extensively uses the javascript frameworks below,
all of which are distributed under the MIT or GNU/GPL license:
D3.js http://d3js.org/  data-oriented javascript framework. 
	- Sankey plugin http://bost.ocks.org/mike/sankey/ for D3.js (heavily modified) by Mike Bostock's, 
	  which is based on the initial version http://tamc.github.io/Sankey/ by Thomas Counsell. 
	  I have incorporated the ability to render Sankey cycles, as pioneered by https://github.com/cfergus
	- NVD3 http://nvd3.org/ extension for D3.js by Novus Partners
	- Dragdealer.js href="http://skidding.github.io/dragdealer/ by Ovidiu Chereches
*/

/***
 * Replace spaces by hyphens. ( - )  for TEXT to URL
 * @param s {string}
 */
function stripSpaces(s) { return s.replace(/\s/g, "-"); }

/***
 * Replace hyphens by spaces, for URL to TEXT
 * @param s {string}
 */
function addSpaces(s) {	return s.replace(/-/g, " "); }

//check if in dev mode and on local server
var datapath = window.location.hostname === "localhost"
	? "./" 
	: "https://raw.githubusercontent.com/NELCSU/ED/master/docs/";

/***
 * function to display content (from hash or menu)
 * @param a {string}
 * @param hash {string}
 */
function disp_content(a, hash) {
	//hide all
	// @ts-ignore
	d3.select("#content").transition().style("opacity", 0);
	//send backwards
	// @ts-ignore
	d3.select("#content").style("z-index", -1);
	//hide
	// @ts-ignore
	d3.select("#content").transition().delay(250).style("visibility", "hidden");

	//show and bring forward
	// @ts-ignore
	d3.select(a).style("visibility", "visible");
	// @ts-ignore
	d3.select(a).transition().style("opacity", 1);
	// @ts-ignore
	d3.select(a).style("z-index", 0);
	window.location.hash = hash;
}

var inithash = "";
var myhash = addSpaces(window.location.hash);
var inithash = inithash + myhash;
var myindex = myhash.slice(2, 4);
var day = myhash.slice(5, 9);
var stp = myhash.slice(10, myhash.length);

//<!--PIE CHARTS-->

// @ts-ignore
var widepie = Math.max(220, parseInt(d3.select("#mypie").style("width")));
// @ts-ignore
var highpie = parseInt(d3.select("#mypie").style("height"));
var mbottom = 0;
var one = true;
// @ts-ignore
d3.select("#mypie2").style("width", widepie / 2);
// @ts-ignore
d3.select("#mypie2").style("margin-right", widepie / 2 + 10);
var piewidth = widepie;

// @ts-ignore
function updatepie(data, placeholder, placelabel1, placelabel2, pievalue, flow) {
	one = flow;
	if (flow) {
		piewidth = widepie;
		mbottom = 285 + 25;
	} else {
		piewidth = widepie / 2;
		mbottom = 285 + 40;
	}
	// @ts-ignore
	if (document.getElementById("legend").checked) {
		// @ts-ignore
		nv.addGraph(function () {
			// @ts-ignore
			var chart = nv.models.pieChart().x(function (d) {
					return d.l;
				// @ts-ignore
				}).y(function (d) {
					return d.v;
				})
				.showLabels(true) //Display pie labels
				.labelThreshold(0.05) //Configure the minimum slice size for labels to show up
				.labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
				.donut(true) //Turn on Donut mode.
				.donutRatio(0.35); //Configure how big you want the donut hole size to be.
			// @ts-ignore
			d3.select(placeholder).style("width", piewidth);
			// @ts-ignore
			d3.select(placeholder).style("height", highpie - mbottom);
			// @ts-ignore
			d3.select(placeholder).style("margin-bottom", mbottom);
			// @ts-ignore
			d3.selectAll(placeholder + " svg").selectAll(".centerpielabel").remove();
			// @ts-ignore
			d3.selectAll(placeholder + " svg").append("text").attr("x", parseInt(d3.select(placeholder).style("width")) / 2).attr("y", parseInt(d3.select(placeholder).style("height")) - parseInt(d3.select(placeholder).style("width")) / 2 - 10).attr("class", "centerpielabel").text(placelabel1);
			// @ts-ignore
			d3.selectAll(placeholder + " svg").append("text").attr("x", parseInt(d3.select(placeholder).style("width")) / 2).attr("y", parseInt(d3.select(placeholder).style("height")) - parseInt(d3.select(placeholder).style("width")) / 2 + 4).attr("class", "centerpielabel").text(placelabel2);
			var pietext = '';
			if (supplyselected) {
				pietext = format(pievalue);
			} else {
				pietext = format(pievalue); //was format2
			}
			// @ts-ignore
			d3.selectAll(placeholder + " svg").append("text").attr("x", parseInt(d3.select(placeholder).style("width")) / 2).attr("y", parseInt(d3.select(placeholder).style("height")) - parseInt(d3.select(placeholder).style("width")) / 2 + 18).attr("class", "centerpielabel").text(pietext);
			// @ts-ignore
			d3.select(placeholder + " svg").datum(data).transition().duration(350).call(chart);
			return chart;
		});
	}
}

function updpieleg() {
	// @ts-ignore
	if (document.getElementById("legend2").checked) {
		// @ts-ignore
		d3.selectAll(".nv-legend").attr("display", "inline");
	} else {
		// @ts-ignore
		d3.selectAll(".nv-legend").attr("display", "none");
	}
}

function updpievis() {
	// @ts-ignore
	if (document.getElementById("legend").checked) {
		show("#mypie");
		// @ts-ignore
		document.getElementById("legend2").disabled = false;
		if (!one) show("#mypie2");
	} else {
		// @ts-ignore
		document.getElementById("legend2").disabled = true;
		hide(".pielegend");
	}
}

// @ts-ignore
function show(placeholder) {
	// @ts-ignore
	if (document.getElementById("legend").checked) {
		// @ts-ignore
		d3.selectAll(placeholder + " svg").attr("display", "inline");
	}
}

// @ts-ignore
function hide(placeholder) {
	// @ts-ignore
	d3.selectAll(placeholder + " svg").attr("display", "none");
}

//<!--DYNAMIC SELECTORS-->

// @ts-ignore
function linearRegression(y, x) {
	var lr = {};
	var n = y.length;
	var sum_x = 0;
	var sum_y = 0;
	var sum_xy = 0;
	var sum_xx = 0;
	var sum_yy = 0;

	for (var i = 0; i < y.length; i++) {

		sum_x += x[i];
		sum_y += y[i];
		sum_xy += (x[i] * y[i]);
		sum_xx += (x[i] * x[i]);
		sum_yy += (y[i] * y[i]);
	}

	lr.slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
	lr.intercept = (sum_y - lr.slope * sum_x) / n;
	lr.r2 = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

	return lr;
}
// @ts-ignore
var dropdown = d3.select("#json_sources");
// @ts-ignore
var dayselect = d3.select("#days");
var supplyselected = false;
var padding = 28;
var paddingmultiplier = 50;
var lowopacity = 0.3;
var highopacity = 0.7;
// @ts-ignore
var format2Number = d3.format(",.2f"),
	// @ts-ignore
	format1Number = d3.format(",.1f"),
	// @ts-ignore
	formatNumber = d3.format(",.0f"),
	// @ts-ignore
	format = function (a) {
		return formatNumber(a);
	},
	// @ts-ignore
	format1 = function (a) {
		return format1Number(a);
	},
	// @ts-ignore
	format2 = function (a) {
		return format2Number(a);
	},
	// @ts-ignore
	color = d3.scale.category20();

// @ts-ignore
var sizecorrection = Math.max(0, 220 - parseInt(window.innerWidth * 0.2));

// @ts-ignore
d3.select("#chart").style("width", document.getElementById("chart").offsetWidth - sizecorrection);
// @ts-ignore
d3.select("#titlebar").style("width", document.getElementById("titlebar").offsetWidth - sizecorrection);
// @ts-ignore
d3.select("#timeslider").style("width", document.getElementById("titlebar").offsetWidth);
var margin = {
		top: 70,
		right: 10,
		bottom: 12,
		left: 40
	},
	// @ts-ignore
	width = document.getElementById("chart").offsetWidth - margin.left - margin.right,
	// @ts-ignore
	height = document.getElementById("chart").offsetHeight - margin.bottom - 130;
// @ts-ignore
var svg = d3.select("#chart").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// @ts-ignore
var sankey = d3.sankey().nodeWidth(30).nodePadding(padding).size([width, height]);
var path = sankey.reversibleLink();
var calo = '--';
var a3 = "1";
var dayIndex = 0;
if (day) {
	var prevday = day;
} else {
	var prevday = "0304";
} //select initial day, optional, otherwise defaults to first entry in list

if (myindex) {
	// @ts-ignore
	document.getElementById("b" + myindex).checked = true;
} else {
	// @ts-ignore
	document.getElementById("b00").checked = true;
} //select initial index, optional, otherwise defaults

var firstgo = true;
// @ts-ignore
var svg2 = d3.select("#chart2").append("svg").attr("width", 160).attr("height", 70).append("g").attr("transform", "translate(20,10)");
// @ts-ignore
var sankey2 = d3.sankey().nodeWidth(10).nodePadding(1).size([125, 50]);
// @ts-ignore
var timedragdealer = new Dragdealer();
var change = function () {};
var change2 = function () {};
// @ts-ignore
var scrollsankey = function (a) {};

document.addEventListener("keydown", function (event) {
	if ((event.keyCode == 27) || (event.keyCode >= 33 && event.keyCode <= 34) || (event.keyCode >= 37 && event.keyCode <= 40)) {
		switch (event.keyCode) {
			case 27: // ESC for help
				// @ts-ignore
				if (document.getElementById('helppop').style.display == 'block') document.getElementById('helppop').style.display = 'none';
				// @ts-ignore
				else document.getElementById('helppop').style.display = 'block';
				break;
			case 33: // pg up
			case 37: // left
			case 38: // up
				// @ts-ignore
				if (d3.select("#content").style("opacity") == 1) {
					scrollsankey(1);
				} //scroll only if we are on the sankey page
				break;
			case 34: // pg down
			case 39: // right
			case 40: // down 
				// @ts-ignore
				if (d3.select("#content").style("opacity") == 1) {
					scrollsankey(-1);
				}
				break;
		}

		event.preventDefault();
	}
}, false);
var tiptext = "no data";
var coordinates = [0, 0];

// Define div for tooltips
// @ts-ignore
var tooltipdiv = d3.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0)
	.on("mouseover", function () {
		tooltipdiv.transition()
			.delay(300)
			.duration(200)
			.style("opacity", 1)
			.style("z-index", 10);
	})
	.on("mouseout", function () {
		tooltipdiv.transition()
			.delay(300)
			.duration(200)
			.style("opacity", 0)
			.style("z-index", -10);
	})
	.on("click", function () {
		tooltipdiv.transition()
			.duration(200)
			.style("opacity", 0)
			.style("z-index", -10);
	})
	.attr("onmousewheel", "scrollsankey(event.wheelDelta)");

// @ts-ignore
var old;
// @ts-ignore
var tipshow = function (d) {
	tooltipdiv.transition()
		.delay(300)
		.duration(200)
		.style("opacity", 1)
		.style("z-index", 10);

	// @ts-ignore
	if (!d || d != old) {
		tooltipdiv.html('<table style="text-align:center;">' + tiptext + '</table>')
			// @ts-ignore
			.style("left", (d3.event.pageX + 30) + "px")
			// @ts-ignore
			.style("top", (d3.event.pageY - 30) + "px");
	}
};

// @ts-ignore
var tiphide = function (d) {
	old = d;
	tooltipdiv.transition()
		.delay(300)
		.duration(200)
		.style("opacity", 0)
		.style("z-index", -10);
};

// @ts-ignore
d3.json(datapath + "json/stp.json", function (d) {
	dropdown.selectAll("option").remove();

	for (var key in d.stp) {
		dropdown.append("option").text(d.stp[key]);
	}

	if (stp) {
		dropdown.node().value = stp;
	}
	dropdown.on("change", sourcechange);

	var setdays = function () {
		var filepath = datapath + "json/" + dropdown.node().value + ".zip";
		// @ts-ignore
		JSZipUtils.getBinaryContent(filepath, function (err, rawdata) {
			// @ts-ignore
			var zip = new JSZip(rawdata);
			var qdata = JSON.parse(zip.files[dropdown.node().value + "m.json"].asText());
			var missing = qdata.missing;
			var estimated = qdata.estimated;
			var interpolatedall = qdata.interpolated;

			dayselect.selectAll("option").remove();
			for (var key in interpolatedall) {
				dayselect.append("option").text(key);
			}

			// @ts-ignore
			dayselect.node().value = "0304"; // Math.max(Math.min(prevday, Math.max.apply(null, Object.keys(interpolatedall))), Math.min.apply(null, Object.keys(interpolatedall)));

			// @ts-ignore
			d3.select("#cid").text(dropdown.node().value);

			//<!--SANKEY DIAGRAM-->

			change = function () {
				var a = dropdown.node().value + dayselect.node().value;

				var b00 = document.getElementById("b00");
				// @ts-ignore
				if (b00 && b00.checked) {
					a = a + "00";
				}

				var b10 = document.getElementById("b10");
				// @ts-ignore
				if (b10 && b10.checked) {
					a = a + "10";
				}

				var b20 = document.getElementById("b20");
				// @ts-ignore
				if (b20 && b20.checked) {
					a = a + "20";
				}

				var b30 = document.getElementById("b30");
				// @ts-ignore
				if (b30 && b30.checked) {
					a = a + "30";
				}

				var b01 = document.getElementById("b01");
				// @ts-ignore
				if (b01 && b01.checked) {
					a = a + "01";
				}

				var b11 = document.getElementById("b11");
				// @ts-ignore
				if (b11 && b11.checked) {
					a = a + "11";
				}

				var b21 = document.getElementById("b21");
				// @ts-ignore
				if (b21 && b21.checked) {
					a = a + "21";
				}

				var b31 = document.getElementById("b31");
				// @ts-ignore
				if (b31 && b31.checked) {
					a = a + "31";
				}

				var b02 = document.getElementById("b02");
				// @ts-ignore
				if (b02 && b02.checked) {
					a = a + "02";
				}
	
				var b12 = document.getElementById("b12");
				// @ts-ignore
				if (b12 && b12.checked) {
					a = a + "12";
				}

				var b22 = document.getElementById("b22");
				// @ts-ignore
				if (b22 && b22.checked) {
					a = a + "22";
				}
			
				var b32 = document.getElementById("b32");
				// @ts-ignore
				if (b32 && b32.checked) {
					a = a + "32";
				}

				var b03 = document.getElementById("b03");
				// @ts-ignore
				if (b03 && b03.checked) {
					a = a + "03";
				}
	
				var b13 = document.getElementById("b13");
				// @ts-ignore
				if (b13 && b13.checked) {
					a = a + "13";
				}

				var b23 = document.getElementById("b23");
				// @ts-ignore
				if (b23 && b23.checked) {
					a = a + "23";
				}
			
				var b33 = document.getElementById("b33");
				// @ts-ignore
				if (b33 && b33.checked) {
					a = a + "33";
				}

				//push hash for easy sharing
				myhash = "&" + a.slice(a.length - 2, a.length) + "&" + dayselect.node().value + "&" + stripSpaces(dropdown.node().value);
				window.location.hash = myhash;
				a3 = a.slice(a.length - 1, a.length);

				if (a3 == "3") {
					// @ts-ignore
					d3.select("#ER").text("SEED");
					// @ts-ignore
					d3.select("#units").text("ktonnes");
					supplyselected = true;
				} else {
					// @ts-ignore
					d3.select("#ER").text("EROEI");
					// @ts-ignore
					d3.select("#units").text("TWh");
					supplyselected = false;
				}

				// @ts-ignore
				if ((b30 && b30.checked) || (b31 && b31.checked) || (b32 && b32.checked) || (b33 && b33.checked)) {
					paddingmultiplier = 5;
				} else {
					paddingmultiplier = 50;
				}
				// @ts-ignore
				padding = paddingmultiplier * (1 - densityslider.getValue()[0]) + 3;

				//<!--DATA QUALITY INFO-->

				var data_quality_info = function () {
					// @ts-ignore
					d3.select("#yid").text(dayselect.node().value);

					var interpolated = interpolatedall[dayselect.node().value];

					var qualitytooltip = "<table style='font-size:12px;'><tr><td style='border-bottom:solid 1px #888;'>Data availability for <b>" + dayselect.node().value + ": </b>";
					// @ts-ignore
					if ((interpolated.length < 1) & (missing.length < 1) & (estimated.length < 1)) {
						// @ts-ignore
						d3.select("#quality").text("▪▪▪▪▪▪▪▪▪▪").style("color", "#2a2");
						qualitytooltip = qualitytooltip + "<b style='color:#2a2;'" + ">Complete</b></td></tr><tr><td>All data is available in the database.</td></tr>";
					} else {
						// @ts-ignore
						if ((interpolated.length + estimated.length < 3) & (missing.length < 3)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▪▪▪▫").style("color", "#2a2");
							qualitytooltip = qualitytooltip + "<b style='color:#2a2;'" + ">Very High</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 5) & (missing.length < 1)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▪▪▪▫").style("color", "#2a2");
							qualitytooltip = qualitytooltip + "<b style='color:#2a2;'" + ">Very High</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 7) & (missing.length < 1)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▪▪▫▫").style("color", "#2a2");
							qualitytooltip = qualitytooltip + "<b style='color:#2a2;'" + ">High</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 5) & (missing.length < 3)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▪▪▫▫").style("color", "#2a2");
							qualitytooltip = qualitytooltip + "<b style='color:#2a2;'" + ">High</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 3) & (missing.length < 5)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▪▪▫▫").style("color", "#2a2");
							qualitytooltip = qualitytooltip + "<b style='color:#2a2;'" + ">High</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 5) & (missing.length < 5)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
							qualitytooltip = qualitytooltip + "<b style='color:#f60;'" + ">Medium</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 7) & (missing.length < 3)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
							qualitytooltip = qualitytooltip + "<b style='color:#f60;'" + ">Medium</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 9) & (missing.length < 1)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
							qualitytooltip = qualitytooltip + "<b style='color:#f60;'" + ">Medium</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 11) & (missing.length < 1)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
							qualitytooltip = qualitytooltip + "<b style='color:#f60;'" + ">Medium</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 9) & (missing.length < 3)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
							qualitytooltip = qualitytooltip + "<b style='color:#f60;'" + ">Medium</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 7) & (missing.length < 5)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
							qualitytooltip = qualitytooltip + "<b style='color:#f60;'" + ">Medium</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 5) & (missing.length < 7)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
							qualitytooltip = qualitytooltip + "<b style='color:#f60;'" + ">Medium</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 13) & (missing.length < 1)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 11) & (missing.length < 3)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 9) & (missing.length < 5)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 9) & (missing.length < 7)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 11) & (missing.length < 5)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 13) & (missing.length < 3)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 15) & (missing.length < 1)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 17) & (missing.length < 1)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Low</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 15) & (missing.length < 3)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Low</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 13) & (missing.length < 5)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Low</b></td></tr>";
						// @ts-ignore
						} else if ((interpolated.length + estimated.length < 11) & (missing.length < 7)) {
							// @ts-ignore
							d3.select("#quality").text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Low</b></td></tr>";
						} else {
							// @ts-ignore
							d3.select("#quality").text("▪▪▫▫▫▫▫▫▫▫").style("color", "#D90000");
							qualitytooltip = qualitytooltip + "<b style='color:#D90000;'" + ">Low</b></td></tr>";
						}
						if (missing.length > 0) qualitytooltip = qualitytooltip + "<tr><td><b>Missing data:</b></td></tr><tr><td>" + JSON.stringify(missing).replace(/\"/g, "").replace(/\,/g, "</td></tr><tr><td>").replace(/\[/g, "").replace(/\]/g, "") + "</td></tr>";
						if (estimated.length > 0) qualitytooltip = qualitytooltip + "<tr><td><b>Estimated data:</b></td></tr><tr><td>" + JSON.stringify(estimated).replace(/\"/g, "").replace(/\,/g, "</td></tr><tr><td>").replace(/\[/g, "").replace(/\]/g, "") + "</td></tr>";
						if (interpolated.length > 0) qualitytooltip = qualitytooltip + "<tr><td><b>Interpolated data:</b></td></tr><tr><td>" + JSON.stringify(interpolated).replace(/\"/g, "").replace(/\,/g, "</td></tr><tr><td>").replace(/\[/g, "").replace(/\]/g, "") + "</td></tr>";
					}
					qualitytooltip = qualitytooltip + "</table>";
					// @ts-ignore
					d3.select("#qualitywrap")
						.on("mouseover", function () {
							tiptext = qualitytooltip;
							tipshow();
						})
						.on("mouseout", tiphide);
				}; //data_quality_info

				data_quality_info();

				// @ts-ignore
				var mouseovr = function (a, d) {
					// @ts-ignore
					d3.select(a).style('opacity', highopacity);
					if (supplyselected) {
						if (d.value != 0) {
							calo = format2(d.prod / (d.value * 0.00116222222 / 100));
						} else calo = '--';
						tiptext = "<tr><td style='font-weight:bold;color:" + d.source.color + ";'>" + d.source.name + "</td><td style='font-size:24px;'>→</td><td style='font-weight:bold;color:" + d.target.color + ";'>" + d.target.name + "</td></tr><tr><td>Weight</td><td>" + format(d.value) + "</td><td> ktonnes</td></tr><tr><td>Calls</td><td>" + format2(d.prod) + "</td><td> TWh</td></tr><tr><td>Caloric value</td><td>" + calo + "</td><td>kcal/100g</td></tr>";
					} else {
						if (d.prod != 0) {
							calo = format2(d.value / (d.prod * 0.00116222222 / 100));
						} else calo = '--';
						tiptext = "<tr><td style='font-weight:bold;color:" + d.source.color + ";'>" + d.source.name + "</td><td style='font-size:24px;'>→</td><td style='font-weight:bold;color:" + d.target.color + ";'>" + d.target.name + "</td></tr><tr><td>Calls</td><td>" + format2(d.value) + "</td><td> TWh</td></tr><tr><td>Weight</td><td>" + format(d.prod) + "</td><td> ktonnes</td></tr><tr><td>Caloric value</td><td>" + calo + "</td><td>kcal/100g</td></tr>";
					}
					tipshow(d);
					// @ts-ignore
					pietooltip = setTimeout(function () {
						hide("#mypie2");
						updatepie(eval(d.supply), "#mypie", d.source.name, d.target.name, d.value, true);
					}, 500);
				};
				// @ts-ignore
				var mouseovr2 = function (d) {
					// @ts-ignore
					var nodesource = [];
					// @ts-ignore
					var nodetarget = [];
					// @ts-ignore
					svg.selectAll(".link").filter(function (l) {
						return l.source == d || l.target == d;
					}).transition().style('opacity', highopacity);
					// @ts-ignore
					svg.selectAll(".link").filter(function (l) {
						return l.target == d;
					// @ts-ignore
					})[0].forEach(function (l) {
						nodesource.push(JSON.parse("{\"l\":\"" + l.__data__.source.name + "\", \"v\":" + l.__data__.value + "}"));
					});
					// @ts-ignore
					svg.selectAll(".link").filter(function (l) {
						return l.source == d;
					// @ts-ignore
					})[0].forEach(function (l) {
						nodetarget.push(JSON.parse("{\"l\":\"" + l.__data__.target.name + "\", \"v\":" + l.__data__.value + "}"));
					});
					if (nodesource.length == 0) {
						nodesource = eval('[{\"l\":\"None\", \"v\":0}]');
					}
					if (nodetarget.length == 0) {
						nodetarget = eval('[{\"l\":\"None\", \"v\":0}]');
					}

					if (supplyselected) {
						// @ts-ignore
						tiptext = "<tr><td colspan=2 style='font-weight:bold;color:" + d.color + ";'>" + d.name + "</td></tr><tr><td>Incoming</td><td>" + format(d3.sum(nodesource, function (d) {
							return d.v;
						// @ts-ignore
						})) + " ktonnes</td></tr><tr><td>Outgoing</td><td>" + format(d3.sum(nodetarget, function (d) {
							return d.v;
						})) + " ktonnes</td></tr>";
					} else {
						// @ts-ignore
						tiptext = "<tr><td colspan=2 style='font-weight:bold;color:" + d.color + ";'>" + d.name + "</td></tr><tr><td>Incoming</td><td>" + format2(d3.sum(nodesource, function (d) {
							return d.v;
						// @ts-ignore
						})) + " TWh</td></tr><tr><td>Outgoing</td><td>" + format2(d3.sum(nodetarget, function (d) {
							return d.v;
						})) + " TWh</td></tr>";
					}
					// @ts-ignore
					var outin = format2(d3.sum(nodetarget, function (d) {
						return d.v;
					// @ts-ignore
					}) / d3.sum(nodesource, function (d) {
						return d.v;
					}));
					// @ts-ignore
					if ((d3.sum(nodesource, function (d) {
							return d.v;
						// @ts-ignore
						}) == 0) || (d3.sum(nodetarget, function (d) {
							return d.v;
						}) == 0)) outin = "--";
					tiptext += "<tr><td>OUT / IN</td><td>" + outin + "</td></tr>";

					tipshow();
					// @ts-ignore
					pietooltip = setTimeout(function () {
						show("#mypie2");
						// @ts-ignore
						updatepie(nodesource, "#mypie2", "Incoming", d.name, d3.sum(nodesource, function (d) {
							return d.v;
						}), false);
						// @ts-ignore
						updatepie(nodetarget, "#mypie", d.name, "Outgoing", d3.sum(nodetarget, function (d) {
							return d.v;
						}), false);


					}, 500);
				};

				//<!--MAIN SANKEY-->
				var ndata = JSON.parse(zip.files[a + ".json"].asText());
				svg.selectAll("g").remove();
				// @ts-ignore
				sankey = d3.sankey().nodeWidth(30).nodePadding(padding).size([width, height]);
				sankey.nodes(ndata.nodes).links(ndata.links).layout(32);
				var g = svg.append("g") //link
					// @ts-ignore
					.selectAll(".link").data(ndata.links).enter().append("g").attr("class", "link").sort(function (j, i) {
						return i.dy - j.dy;
					});
				var h = g.append("path") //path0
					.attr("d", path(0));
				var f = g.append("path") //path1
					.attr("d", path(1));
				var e = g.append("path") //path2
					.attr("d", path(2));

				// @ts-ignore
				g.attr("fill", function (i) {
						if (i.source.fill) return i.source.fill;
						else return i.source.color = color(i.source.name.replace(/ .*/, ""));
					})
					.attr("opacity", lowopacity)
					// @ts-ignore
					.on("mouseover", function (d) {
						// @ts-ignore
						mouseovr(this, d);
					})
					// @ts-ignore
					.on("click", function (d) {
						// @ts-ignore
						mouseovr(this, d);
					// @ts-ignore
					}).on("mouseout", function (d) {
						// @ts-ignore
						d3.select(this).style('opacity', lowopacity);
						// @ts-ignore
						window.clearTimeout(pietooltip);
						tiphide(d);
					});
				var c = svg.append("g")
					// @ts-ignore
					.selectAll(".node").data(ndata.nodes).enter().append("g").attr("class", "node").attr("transform", function (i) {
						return "translate(" + i.x + "," + i.y + ")";
					// @ts-ignore
					}).call(d3.behavior.drag().origin(function (i) {
						return i;
					}).on("dragstart", function () {
						// @ts-ignore
						this.parentNode.appendChild(this);
					}).on("drag", b));
				c.append("rect") //node
					// @ts-ignore
					.attr("height", function (i) {
						return i.dy;
					// @ts-ignore
					}).attr("width", sankey.nodeWidth()).style("fill", function (i) {
						if (i.fill) return i.color = i.fill;
						else return i.color = color(i.name.replace(/ .*/, ""));
					// @ts-ignore
					}).style("stroke", function (i) {
						// @ts-ignore
						return d3.rgb(i.color).darker(2);
					// @ts-ignore
					}).on("mouseover", function (d) {
						mouseovr2(d);
					// @ts-ignore
					}).on("click", function (d) {
						mouseovr2(d);
					// @ts-ignore
					}).on("mouseout", function (d) {
						// @ts-ignore
						svg.selectAll(".link").filter(function (l) {
							return l.source == d || l.target == d;
						}).transition().style('opacity', lowopacity);
						// @ts-ignore
						window.clearTimeout(pietooltip);
						tiphide();
					// @ts-ignore
					}).on("dblclick", function (d) {
						// @ts-ignore
						svg.selectAll(".link").filter(function (l) {
							return l.source == d;
						}).attr("display", function () {
							// @ts-ignore
							if (d3.select(this).attr("display") == "none") return "inline";
							else return "none";
						});
					});
				c.append("text") //node
					// @ts-ignore
					.attr("x", -6).attr("y", function (i) {
						return i.dy / 2;
					// @ts-ignore
					}).attr("dy", ".35em").attr("text-anchor", "end").attr("transform", null).text(function (i) {
						return i.name;
					// @ts-ignore
					}).filter(function (i) {
						return i.x < width / 2;
					}).attr("x", 6 + sankey.nodeWidth()).attr("text-anchor", "start");
				c.append("text") //node
					// @ts-ignore
					.attr("x", function (i) {
						return -i.dy / 2;
					})
					// @ts-ignore
					.attr("y", function (i) {
						return i.dx / 2 + 6;
					})
					// @ts-ignore
					.attr("transform", "rotate(270)").attr("text-anchor", "middle").text(function (i) {
						if (i.dy > 50) {
							if (i.value < 1) return format2(i.value);
							else if (i.value < 10) return format1(i.value);
							else return format(i.value);
						}
					})
					.attr("fill", "#aa8") //hardcoded from theme
					.attr("stroke", "#111") //hardcoded from theme
					.style("text-shadow", "0 0 0 #000")
					.style("font-weight", "bold");

				// @ts-ignore
				function b(i) { //dragmove
					// @ts-ignore
					if (document.getElementById("ymove").checked) {
						// @ts-ignore
						if (document.getElementById("xmove").checked) {
							// @ts-ignore
							d3.select(this).attr("transform", "translate(" + (i.x = Math.max(0, Math.min(width - i.dx, d3.event.x))) + "," + (i.y = Math.max(0, Math.min(height - i.dy, d3.event.y))) + ")");
						} else {
							// @ts-ignore
							d3.select(this).attr("transform", "translate(" + i.x + "," + (i.y = Math.max(0, Math.min(height - i.dy, d3.event.y))) + ")");
						}
					} else {
						// @ts-ignore
						if (document.getElementById("xmove").checked) {
							// @ts-ignore
							d3.select(this).attr("transform", "translate(" + (i.x = Math.max(0, Math.min(width - i.dx, d3.event.x))) + "," + i.y + ")");
						}
					}
					sankey.relayout();
					f.attr("d", path(1));
					h.attr("d", path(0));
					e.attr("d", path(2));
				}
				//})

				//<!--EROEI MINI-SANKEY-->

				var mdata = JSON.parse(zip.files[a.slice(0, a.length - 2) + "k" + a3 + ".json"].asText());
				svg2.selectAll("g").remove();
				// @ts-ignore
				sankey2 = d3.sankey().nodeWidth(13).nodePadding(5).size([125, 50]);
				sankey2.nodes(mdata.nodes).links(mdata.links).layout(32);
				var g2 = svg2.append("g") //link
					// @ts-ignore
					.selectAll(".link").data(mdata.links).enter().append("g").attr("class", "link").sort(function (j, i) {
						return i.dy - j.dy;
					});
				// @ts-ignore
				var h2 = g2.append("path") //path0
					.attr("d", path(0));
				// @ts-ignore
				var f2 = g2.append("path") //path1
					.attr("d", path(1));
				// @ts-ignore
				var e2 = g2.append("path") //path2
					.attr("d", path(2));
				// @ts-ignore
				g2.attr("fill", function (i) {
					if (i.source.fill) return i.source.fill;
					else return i.source.color = color(i.source.name.replace(/ .*/, ""));
				}).attr("opacity", lowopacity);
				// @ts-ignore
				var mouseovr3 = function (d) {
					// @ts-ignore
					var nodesource = [];
					// @ts-ignore
					var nodetarget = [];
					// @ts-ignore
					svg2.selectAll(".link").filter(function (l) {
						return l.target == d;
					// @ts-ignore
					})[0].forEach(function (l) {
						nodesource.push(JSON.parse("{\"l\":\"" + l.__data__.source.name + "\", \"v\":" + l.__data__.value + "}"));
					});
					// @ts-ignore
					svg2.selectAll(".link").filter(function (l) {
						return l.source == d;
					// @ts-ignore
					})[0].forEach(function (l) {
						nodetarget.push(JSON.parse("{\"l\":\"" + l.__data__.target.name + "\", \"v\":" + l.__data__.value + "}"));
					});
					if (nodesource.length == 0) {
						nodesource = eval('[{\"l\":\"None\", \"v\":0}]');
					}
					if (nodetarget.length == 0) {
						nodetarget = eval('[{\"l\":\"None\", \"v\":0}]');
					}

					if (supplyselected) {
						// @ts-ignore
						tiptext = "<tr><td colspan=2 style='font-weight:bold;color:" + d.color + ";'>" + d.name + "</td></tr><tr><td>Incoming</td><td>" + format(d3.sum(nodesource, function (d) {
							return d.v;
						// @ts-ignore
						})) + " ktonnes</td></tr><tr><td>Outgoing</td><td>" + format(d3.sum(nodetarget, function (d) {
							return d.v;
						})) + " ktonnes</td></tr>";
					} else {
						// @ts-ignore
						tiptext = "<tr><td colspan=2 style='font-weight:bold;color:" + d.color + ";'>" + d.name + "</td></tr><tr><td>Incoming</td><td>" + format2(d3.sum(nodesource, function (d) {
							return d.v;
						// @ts-ignore
						})) + " TWh</td></tr><tr><td>Outgoing</td><td>" + format2(d3.sum(nodetarget, function (d) {
							return d.v;
						})) + " TWh</td></tr>";
					}
					// @ts-ignore
					var outin = format2(d3.sum(nodetarget, function (d) {
						return d.v;
					// @ts-ignore
					}) / d3.sum(nodesource, function (d) {
						return d.v;
					}));
					// @ts-ignore
					if ((d3.sum(nodesource, function (d) {
							return d.v;
						// @ts-ignore
						}) == 0) || (d3.sum(nodetarget, function (d) {
							return d.v;
						}) == 0)) outin = "--";
					tiptext += "<tr><td>OUT / IN</td><td>" + outin + "</td></tr>";

					tipshow();
					// @ts-ignore
					pietooltip = setTimeout(function () {
						show("#mypie2");
						// @ts-ignore
						updatepie(nodesource, "#mypie2", "Incoming", d.name, d3.sum(nodesource, function (d) {
							return d.v;
						}), false);
						// @ts-ignore
						updatepie(nodetarget, "#mypie", d.name, "Outgoing", d3.sum(nodetarget, function (d) {
							return d.v;
						}), false);


					}, 500);
				};

				var c2 = svg2.append("g") //node
					// @ts-ignore
					.selectAll(".node").data(mdata.nodes).enter().append("g").attr("class", "node").attr("transform", function (i) {
						return "translate(" + i.x + "," + i.y + ")";
					});

				c2.append("rect") //node
					// @ts-ignore
					.attr("height", function (i) { return i.dy;	})
					// @ts-ignore
					.attr("width", sankey2.nodeWidth()).style("fill", function (i) {
						if (i.fill) return i.color = i.fill;
						else return i.color = color(i.name.replace(/ .*/, ""));
					})
					// @ts-ignore
					.style("stroke", function (i) { return d3.rgb(i.color).darker(2);	})
					// @ts-ignore
					.on("mouseover", function (d) { mouseovr3(d);	})
					// @ts-ignore
					.on("click", function (d) { mouseovr3(d); })
					// @ts-ignore
					.on("mouseout", function (d) {
						// @ts-ignore
						window.clearTimeout(pietooltip);
						tiphide();
					});

				c2.append("text") //node
					.attr("x", -3)
					// @ts-ignore
					.attr("y", function (i) { return i.dy / 2; })
					.attr("dy", ".35em")
					.attr("font-size", "12px")
					.attr("text-anchor", "end")
					.attr("transform", null)
					// @ts-ignore
					.text(function (i) {
						if (i.dy > 5) {
							if (i.name == "Balance") return "";
							else
							if (i.name == "Renewables & Nuclear") return "Renew";
							if (i.name == "Crop Residue") return "Resid";
							if (i.name == "Food")
								// @ts-ignore
								if ((a3 == 3) || (a3 == 2)) return "Prod";
							if (i.name == "Biofuels & Other") return "Biofu";
							// @ts-ignore
							if ((i.name == "Stock Draw") | (i.name == "Stock Deposit")) return "Stock";
							else return i.name.slice(0, 6);
						} else return "";
					})
					// @ts-ignore
					.filter(function (i) { return i.x < 100; })
					.attr("x", 3 + sankey2.nodeWidth())
					.attr("text-anchor", "start");
				//})

			};

			dayselect.on("change", daychange);

			function daychange() {
				dayIndex = dayselect.node().value - dayselect.node().options[0].value + 1;
				// @ts-ignore
				d3.select("#timeslider").select(".value").text(parseInt(dayselect.node().value));
				timedragdealer.setValue((dayIndex - 1) / (dayselect.node().length - 1), 0, false);
			}

			scrollsankey = function (a) { //scroll delta
				if (a < 0) {
					dayIndex = Math.min(dayselect.node().length, dayIndex + 1);
				} else {
					dayIndex = Math.max(1, dayIndex - 1);
				}
				timedragdealer.setValue((dayIndex - 1) / (dayselect.node().length - 1), 0, false);
			};

			//<!--TIME SCROLL-->

			if (firstgo) { //initialize timeslider on first iteration
				// @ts-ignore
				timedragdealer = new Dragdealer("timeslider", {
					x: 0,
					steps: 100, //dayselect.node().length,
					// @ts-ignore
					animationCallback: function (a, b) {
						// @ts-ignore
						d3.select("#timeslider").select(".value").text(parseInt(dayselect.node().options[0].text) + Math.round(a * (parseInt(dayselect.node().options[document.getElementById("days").length - 1].text) - parseInt(dayselect.node().options[0].text))));
					},
					// @ts-ignore
					callback: function (a, b) {
						dayIndex = Math.round(a * (dayselect.node().length - 1)) + 1;
						dayselect.node().selectedIndex = dayIndex - 1;
						change();
					}
				});
				firstgo = false;
			}

			//reset step scale on other iterations
			var x = [];
			var i = 0;
			while (x.push(i++/(dayselect.node().length-1)) < dayselect.node().length);
			timedragdealer.stepRatios = x;
			daychange(); //initialize & trigger change in main sankey
		});
	};

	setdays();

	function sourcechange() {
		prevday = dayselect.node().value;
		setdays();
	}
});