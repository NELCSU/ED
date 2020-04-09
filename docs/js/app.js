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

// UTILITIES #############

/***
 * Replace hyphens by spaces
 * @param {string} s
 */
function addSpaces(s) {	return s.replace(/-/g, " "); }

/**
 * returns short date format based on data key "daymonth" e.g. "0102" being 1st Feb
 * @param {string} day 
 */
function getScreenDate(day) {
	var today = new Date(new Date().getFullYear(), parseInt(day.substr(2, 2)) - 1, parseInt(day.substr(0, 2)));
	var strDate = today.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
	return strDate;
}

/***
 * Replace spaces by hyphens
 * @param {string} s
 */
function stripSpaces(s) { return s.replace(/\s/g, "-"); }

// @ts-ignore
var format2 = d3.format(",.2f"), format1 = d3.format(",.1f"), format0 = d3.format(",.0f");
/**
 * 
 * @param {number} v 
 */
function format(v) {
	return v < 1 ? format2(v) : v < 10 ? format1(v) : format0(v);
}

/**
 * Select n characters from the left side of string s
 * @param {string} s 
 * @param {number} n 
 */
function left(s, n) {
	return s.slice(0, Math.abs(n));
}

/**
 * Select n characters from the right side of string s
 * @param {string} s 
 * @param {number} n 
 */
function right(s, n) {
	return s.slice(-1 * n);
}

/**
 * Scans for first valid file and select corresponding call menu choice
 * @param {any} config
 */
function setDefaultCall(config) {	
	var files = Object.keys(config.zip.files);
	// @ts-ignore
	var ctrl;
	// @ts-ignore
	config.calls.forEach(function(call) {
		ctrl = document.getElementById(call.id);
		if (ctrl) {
			// @ts-ignore
			ctrl.disabled = true;
		}
	});
	var selected = false;
	for (var i = 0; i < files.length; i++) {
		var key = right(files[i], 7);
		key = left(key, 2);
		// @ts-ignore
		var found = config.calls.findIndex(function(e) { return e.value === key; })
		if (found > -1) {
			// @ts-ignore
			var ctrl = document.getElementById(config.calls[found].id);
			if (ctrl) {
				// @ts-ignore
				ctrl.disabled = false;
				if (!selected) {
					// @ts-ignore
					ctrl.checked = true;
					selected = true;
				}
			}
			
		}
	}
}

/**
 * 
 * @param {any} config 
 */
function userSelectionChange (config) {
	setQueryHash();
	var choice = getQueryHash();
	var calls = document.querySelector("input[name='r1']:checked");
	var callText = choice.call;
	if (calls) {
		// @ts-ignore
		callText = calls.title;
	}
	window.dispatchEvent(new CustomEvent("call-selection", { detail: { text: callText, value: choice.call }}));
	window.dispatchEvent(new CustomEvent("day-selection", { detail: { text: getScreenDate(choice.day), value: choice.day }}));

	// @ts-ignore
	config.padding = config.paddingmultiplier * (1 - config.densityslider.getValue()[0]) + 3;

	var pietooltip = 0;

	//<!--MAIN SANKEY-->
	// @ts-ignore
	config.zip.file(choice.stp + choice.day + choice.call + ".json")
		.async("string")
		// @ts-ignore
		.then(function (content) {
			var ndata = JSON.parse(content);
			config.svg.selectAll("g").remove();

			// @ts-ignore
			config.sankey = d3.sankey()
				.nodeWidth(30)
				// @ts-ignore
				.nodePadding(config.padding)
				.size([config.width, config.height]);

			config.sankey.nodes(ndata.nodes).links(ndata.links).layout(32);

			var linkCollection = config.svg.append("g")
				// @ts-ignore
				.selectAll(".link")
				.data(ndata.links)
				.enter()
				.append("g")
					.attr("class", "link")
					// @ts-ignore
					.sort(function (j, i) { return i.dy - j.dy;	});

			var path = config.sankey.reversibleLink();

			var h = linkCollection.append("path") //path0
				.attr("d", path(0));
			var f = linkCollection.append("path") //path1
				.attr("d", path(1));
			var e = linkCollection.append("path") //path2
				.attr("d", path(2));

			// @ts-ignore
			linkCollection.attr("fill", function (i) { return i.source.fill; })
			.attr("opacity", config.lowopacity)
			// @ts-ignore
			.on("mouseover", function (d) { mouseOverLink(this, d, config); })
			// @ts-ignore
			.on("click", function (d) { mouseOverLink(this, d, config); })
			// @ts-ignore
			.on("mouseout", function (d) {
				// @ts-ignore
				d3.select(this)
					.style('opacity', config.lowopacity);
				// @ts-ignore
				window.clearTimeout(pietooltip);
				window.dispatchEvent(new CustomEvent("hide-tip", { detail: d }));
			});

			var nodeCollection = config.svg.append("g")
				.selectAll(".node")
				.data(ndata.nodes)
				.enter()
				.append("g")
					.attr("class", "node")
					// @ts-ignore
					.attr("transform", function (i) { return "translate(" + i.x + "," + i.y + ")"; })
					// @ts-ignore
					.call(d3.behavior.drag()
						// @ts-ignore
						.origin(function (i) { return i; })
						// @ts-ignore
						.on("dragstart", function () { this.parentNode.appendChild(this);	})
						// @ts-ignore
						.on("drag", b)
					);

			nodeCollection.append("rect")
				// @ts-ignore
				.attr("height", function (i) { return i.dy; })
				// @ts-ignore
				.attr("width", config.sankey.nodeWidth())
				// @ts-ignore
				.style("fill", function (i) { return i.color = i.fill; })
				// @ts-ignore
				.style("stroke", function (i) {	return d3.rgb(i.color).darker(2);	})
				// @ts-ignore
				.on("mouseover", function (d) { mouseOverNode(d, config);	})
				// @ts-ignore
				.on("click", function (d) {	mouseOverNode(d, config);	})
				// @ts-ignore
				.on("mouseout", function (d) {
					config.svg.selectAll(".link")
							// @ts-ignore
							.filter(function (l) { return l.source == d || l.target == d;  })
							.transition()
							.style('opacity', config.lowopacity);
					window.clearTimeout(pietooltip);
					window.dispatchEvent(new CustomEvent("hide-tip", { detail: d }));
				})
				// @ts-ignore
				.on("dblclick", function (d) {
					// @ts-ignore
					svg.selectAll(".link")
							// @ts-ignore
							.filter(function (l) { return l.source == d; })
							.attr("display", function () {
								// @ts-ignore
								return d3.select(this).style("display") === "none"
									? null
									: "none";
							});
				});

			nodeCollection.append("text")
				.classed("node-label-outer", true)
				.attr("x", -6)
				// @ts-ignore
				.attr("y", function (i) {	return i.dy / 2; })
				.attr("dy", ".35em")
				.attr("text-anchor", "end")
				.attr("transform", null)
				// @ts-ignore
				.text(function (i) { return i.name; })
				// @ts-ignore
				.filter(function (i) { return i.x < config.width / 2; })
				.attr("x", 6 + config.sankey.nodeWidth())
				.attr("text-anchor", "start");

			nodeCollection.append("text") //node
				.classed("node-label", true)
				// @ts-ignore
				.attr("x", function (i) {	return -i.dy / 2;	})
				// @ts-ignore
				.attr("y", function (i) {	return i.dx / 2 + 6; })
				.attr("transform", "rotate(270)")
				// @ts-ignore
				.text(function (i) {
					if (i.dy > 50) {
						return format(i.value)
					}
				});

			// @ts-ignore
			function b(i) { //dragmove
				// @ts-ignore
				if (document.getElementById("ymove").checked) {
					// @ts-ignore
					if (document.getElementById("xmove").checked) {
						// @ts-ignore
						d3.select(this).attr("transform", "translate(" + (i.x = Math.max(0, Math.min(config.width - i.dx, d3.event.x))) + "," + (i.y = Math.max(0, Math.min(config.height - i.dy, d3.event.y))) + ")");
					} else {
						// @ts-ignore
						d3.select(this).attr("transform", "translate(" + i.x + "," + (i.y = Math.max(0, Math.min(config.height - i.dy, d3.event.y))) + ")");
					}
				} else {
					// @ts-ignore
					if (document.getElementById("xmove").checked) {
						// @ts-ignore
						d3.select(this).attr("transform", "translate(" + (i.x = Math.max(0, Math.min(config.width - i.dx, d3.event.x))) + "," + i.y + ")");
					}
				}
				config.sankey.relayout();

				var path = config.sankey.reversibleLink();
				f.attr("d", path(1));
				h.attr("d", path(0));
				e.attr("d", path(2));
			}
		});
}

/**
 * 
 * @param {string} a 
 * @param {any} d 
 * @param {any} config
 */
function mouseOverLink (a, d, config) {
	// @ts-ignore
	d3.selectAll("#secondaryPie svg").style("display", null);

	// @ts-ignore
	d3.select(a).style('opacity', config.highopacity);

	var tiptext = "<tr><td style='font-weight:bold;color:" + d.source.color + ";'>" + d.source.name + "</td><td style='font-size:24px;'>→</td><td style='font-weight:bold;color:" + d.target.color + ";'>" + d.target.name + "</td></tr><tr><td>Calls</td><td>" + format(d.value) + "</td><td> Calls</td></tr>";
	
	window.dispatchEvent(new CustomEvent("show-tip", { detail: tiptext }));
	// @ts-ignore
	pietooltip = setTimeout(function () {
		// @ts-ignore
		updatepie(eval(d.supply), d3.select(".piechart.primary"), d.source.name, d.target.name, d.value);
	}, 500);
}

/**
 * 
 * @param {any} d 
 * @param {any} config
 */
function mouseOverNode(d, config) {
	// @ts-ignore
	d3.selectAll("#secondaryPie svg").style("display", "none");

	// @ts-ignore
	var nodesource = [], nodetarget = [];

	// @ts-ignore
	config.svg.selectAll(".link")
		// @ts-ignore
		.filter(function (l) { return l.source == d || l.target == d; })
		.transition()
		.style('opacity', config.highopacity);

	// @ts-ignore
	config.svg.selectAll(".link")
		// @ts-ignore
		.filter(function (l) { return l.target == d; })[0]
			// @ts-ignore
			.forEach(function (l) {
				nodesource.push(JSON.parse("{\"l\":\"" + l.__data__.source.name + "\", \"v\":" + l.__data__.value + "}"));
			});

	// @ts-ignore
	config.svg.selectAll(".link")
		// @ts-ignore
		.filter(function (l) { return l.source == d; })[0]
			// @ts-ignore
			.forEach(function (l) {
				nodetarget.push(JSON.parse("{\"l\":\"" + l.__data__.target.name + "\", \"v\":" + l.__data__.value + "}"));
			});

	if (nodesource.length == 0) {
		nodesource = eval('[{\"l\":\"None\", \"v\":0}]');
	}

	if (nodetarget.length == 0) {
		nodetarget = eval('[{\"l\":\"None\", \"v\":0}]');
	}

	var tiptext = "<tr><td colspan=2 style='font-weight:bold;color:" + d.color + ";'>" + d.name;
	tiptext += "</td></tr><tr><td>Incoming</td><td>";
	// @ts-ignore
	tiptext += format(d3.sum(nodesource, function (d) { return d.v; }));
	tiptext += " Calls</td></tr><tr><td>Outgoing</td><td>";
	// @ts-ignore
	tiptext += format(d3.sum(nodetarget, function (d) { return d.v; })) + " Calls</td></tr>";
	
	// @ts-ignore
	var outin = format(d3.sum(nodetarget, function (d) { return d.v; }) / d3.sum(nodesource, function (d) { return d.v; }));
	// @ts-ignore
	if ((d3.sum(nodesource, function (d) { return d.v; }) == 0) || 
			// @ts-ignore
			(d3.sum(nodetarget, function (d) { return d.v;	}) == 0)) {
				outin = "--";
	}
	tiptext += "<tr><td>OUT / IN</td><td>" + outin + "</td></tr>";

	window.dispatchEvent(new CustomEvent("show-tip", { detail: tiptext }));

	// @ts-ignore
	pietooltip = setTimeout(function () {
		// @ts-ignore
		updatepie(nodesource, d3.select(".piechart.secondary"), "Incoming", d.name, d3.sum(nodesource, function (d) { return d.v; }));
		// @ts-ignore
		updatepie(nodetarget, d3.select(".piechart.primary"), d.name, "Outgoing", d3.sum(nodetarget, function (d) { return d.v;	}));
	}, 500);
}

function setQueryHash() {
	var calls = document.querySelector("input[name='r1']:checked");
	// @ts-ignore
	var day = d3.select("#day");
	// @ts-ignore
	var stp = d3.select("#stp");
	var myhash = "";
	if (calls) {
		// @ts-ignore
		myhash = "call$" + calls.value + "+";
	}
	myhash += "day$" + day.node().value + "+";
	myhash += "stp$" + stripSpaces(stp.node().value);
	window.location.hash = myhash;
}

function getQueryHash() {
	var re = /\w+\$[\w\-]+/gmi;
	var m, result = { call: "", day: "", stp: "" };
	while ((m = re.exec(window.location.hash)) !== null) {
		var p = m[0].split("$");
		// @ts-ignore
		switch(p[0]) {
			case "call": result.call = p[1]; break;
			case "day": result.day = p[1]; break;
			case "stp": result.stp = addSpaces(p[1]); break;
		}
	}
	return result;
}

// @ts-ignore
function updatepie(data, placeholder, placelabel1, placelabel2, pievalue) {
	// @ts-ignore
	if (document.getElementById("ctrlBreakdown").checked) {
		// @ts-ignore
		nv.addGraph(function () {
			// @ts-ignore
			var chart = nv.models.pieChart()
				// @ts-ignore
				.x(function (d) { return d.l; })
				// @ts-ignore
				.y(function (d) { return d.v; })
				.showLabels(true) //Display pie labels
				.labelThreshold(0.05) //Configure the minimum slice size for labels to show up
				.labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
				.donut(true) //Turn on Donut mode.
				.donutRatio(0.35); //Configure how big you want the donut hole size to be.

			var svg =	placeholder.select("svg");

			// @ts-ignore
			svg.selectAll(".centerpielabel").remove();

			// @ts-ignore
			svg
				.append("text")
				.attr("x", parseInt(placeholder.style("width")) / 2)
				.attr("y", parseInt(placeholder.style("height")) - parseInt(placeholder.style("width")) / 2 - 10)
				.attr("class", "centerpielabel")
				.text(placelabel1);

			// @ts-ignore
			svg.append("text")
				.attr("x", parseInt(placeholder.style("width")) / 2)
				.attr("y", parseInt(placeholder.style("height")) - parseInt(placeholder.style("width")) / 2 + 4)
				.attr("class", "centerpielabel")
				.text(placelabel2);

			var pietext = format(pievalue);
			// @ts-ignore
			svg.append("text")
				.attr("x", parseInt(placeholder.style("width")) / 2)
				.attr("y", parseInt(placeholder.style("height")) - parseInt(placeholder.style("width")) / 2 + 18)
				.attr("class", "centerpielabel")
				.text(pietext);

			// @ts-ignore
			svg.datum(data).transition().duration(350).call(chart);
			return chart;
		});
	}
}

function updpieleg() {
	// @ts-ignore
	if (document.getElementById("ctrlLegend").checked) {
		// @ts-ignore
		d3.selectAll(".nv-legend").style("display", "inline");
	} else {
		// @ts-ignore
		d3.selectAll(".nv-legend").style("display", "none");
	}
}

function toggleBreakdown() {
	var breakdown = document.getElementById("ctrlBreakdown");
	if (breakdown) {
		// @ts-ignore
		document.getElementById("ctrlLegend").disabled = !breakdown.checked;
		// @ts-ignore
		d3.selectAll(".piecharts svg").style("display", breakdown.checked ? null : "none");
	}
}
document.getElementById("ctrlBreakdown")?.addEventListener("click", toggleBreakdown);

/**
 * 
 * @param {any} data 
 * @param {any} config 
 */
function loadDayFileContent(data, config) {
	var interpolatedall = data.interpolated;
	// @ts-ignore
	var day = d3.select("#day");
	day.selectAll("option").remove();
	var prevday;
	for (var key in interpolatedall) {
		if (!prevday) {
			prevday = key;
		}
		day.append("option")
			 .property("value", key)
			 .text(getScreenDate(key));
	}
	// @ts-ignore
	var toSelect = "0" + Math.max(Math.min(prevday, Math.max.apply(null, Object.keys(interpolatedall))), Math.min.apply(null, Object.keys(interpolatedall)));
	toSelect = right(toSelect, 4);
	day.node().value = toSelect;

	setDefaultCall(config);

	window.dispatchEvent(new CustomEvent("data-quality", { detail: {
		day: day.node().value,
		estimated: data.estimated,
		interpolated: data.interpolated, 
		missing: data.missing, 
	}}));

	// @ts-ignore
	var stp = d3.select("#stp");
	// @ts-ignore
	window.dispatchEvent(new CustomEvent("stp-selection", { detail: { text: stp.node().value, value: stp.node().value }}));
	
	day.on("change", daychange);

	function daychange() {
		window.dispatchEvent(new CustomEvent("stp-selection", { detail: { text: stp.node().value, value: stp.node().value }}));
		var dayIndex = day.node().value - day.node().options[0].value + 1;
		// @ts-ignore
		d3.select("#timeslider")
			.select(".value")
			.text(getScreenDate(day.node().value));
		
		// @ts-ignore
		var dv = day.node().length - 1;
		if (dv < 1) {
			dv = 1;
		}
		dayIndex = dayIndex < 2 ? 1 : dayIndex - 1;
		config.timedragdealer.setValue(dayIndex / dv, 0, false);
	}

	// @ts-ignore
	if (!config.timedragdealer) { //initialize timeslider on first iteration
		// @ts-ignore
		config.timedragdealer = new Dragdealer("timeslider", {
			x: 0,
			steps: 100, //day.node().length,
			// @ts-ignore
			animationCallback: function (a, b) {
				var firstValue = parseInt(day.node().options[0].value);
				var lastValue = parseInt(day.node().options[day.node().length - 1].value);
				var newValue = "0" + (firstValue + Math.round(a * (lastValue - firstValue)));
				newValue = right(newValue, 4);
				// @ts-ignore
				d3.select("#timeslider")
					.select(".value")
					.text(getScreenDate(newValue));
			},
			// @ts-ignore
			callback: function (a, b) {
				var dayIndex = Math.round(a * (day.node().length - 1));
				if (dayIndex < 1 || isNaN(dayIndex)) {
					dayIndex = 0;
				}
				day.node().selectedIndex = dayIndex;
				userSelectionChange(config);
			}
		});
	}
	//reset step scale on other iterations
	var x = [];
	var i = 0;
	while (x.push(i++/(day.node().length-1)) < day.node().length);
	// @ts-ignore
	config.timedragdealer.stepRatios = x;
	daychange(); //initialize & trigger change in main sankey
}

/**
 *
 * @param {any} config
 */
function initDayList(config) {
	// @ts-ignore
	JSZipUtils.getBinaryContent(config.datapath + config.filename, function (err, rawdata) {
		// @ts-ignore
		JSZip.loadAsync(rawdata)
			// @ts-ignore
			.then(function(zipfile) {
				var stp = document.getElementById("stp");
				if (stp) {
					// @ts-ignore
					config.filename = stp.options[stp.selectedIndex].value + "m.json";
				}
				zipfile.file(config.filename)
					.async("string")
					// @ts-ignore
					.then(function (content) {
						config.zip = zipfile;
						loadDayFileContent(JSON.parse(content), config);
					});
			});
	});
}

/**
 * Updates the STP user control
 * @param {any} config 
 */
function initSTPList(config) {
	// @ts-ignore
	var stp = d3.select("#stp");
	stp.selectAll("option").remove();
	for (var key in config.stp) {
		stp.append("option").text(config.stp[key]);
	}
	var choice = getQueryHash();
	if (choice.stp) {
		stp.node().value = choice.stp;
	}

	stp.on("change", function() {
		config.filename = stp.node().value + ".zip";
		initDayList(config);
	});
}

/**
 * 
 * @param {any} config 
 */
function initCallList(config) {
	var calls = Array.from(document.querySelectorAll("input[name='r1']"));
	calls.forEach(function(call) {
		call.addEventListener("click", function() {
			userSelectionChange(config);
		})
	});
	var choice = getQueryHash();
	if (choice.call) {
		// @ts-ignore
		document.getElementById("b" + choice.call).checked = true;
	}
}

/**
 * 
 * @param {any} config 
 */
function initDensitySlider(config) {
	// @ts-ignore
	config.densityslider = new Dragdealer("pslider", {
		x: 0.5,
		steps: 5,
		snap: true,
		// @ts-ignore
		callback: function (a, b) {
			config.padding = config.paddingmultiplier * (1 - a) + 3;
			userSelectionChange(config);
		}
	});
}

/**
 * 
 * @param {any} config 
 */
function initOpacitySlider(config) {
	config.lowopacity = 0.3;
	config.highopacity = 0.7;
	// @ts-ignore
	new Dragdealer("oslider", {
		x: 0.25,
		steps: 5,
		snap: true,
		// @ts-ignore
		callback: function (a, b) {
			config.lowopacity = 0.1 + 0.8 * a;
			userSelectionChange(config);
		}
	});
}

/**
 * 
 * @param {any} config 
 */
function initCharts(config) {
	var margin = {
		top: 70,
		right: 10,
		bottom: 12,
		left: 40
	};
	// @ts-ignore
	config.width = document.getElementById("chart").offsetWidth - margin.left - margin.right;
	// @ts-ignore
	config.height = document.getElementById("chart").offsetHeight - margin.bottom - 130;
	// @ts-ignore
	config.svg = d3.select("#chart")
		.append("svg")
			.attr("width", config.width + margin.left + margin.right)
			.attr("height", config.height + margin.top + margin.bottom)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

// APPLICATION ENTRY POINT
var datapath = window.location.hostname === "localhost"
	? "./json/" 
	: "https://raw.githubusercontent.com/NELCSU/ED/master/docs/json/";

// @ts-ignore
d3.json(datapath + "config.json", function(d) {
	var config = d;
	config.datapath = datapath;
	config.paddingmultiplier = 50;
	initCallList(config);
	initDensitySlider(config);
	initOpacitySlider(config);
	initCharts(config)
	initSTPList(config);
	var stp = document.getElementById("stp");
	if (stp) {
		stp.dispatchEvent(new Event("change"));
	}
});