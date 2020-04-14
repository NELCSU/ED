/*This software is released under the MIT License

Copyright (C) 2014 Denes Csala http://www.csaladen.es

This website accompanies the research paper entitled
Food and Energy in the Global Sustainable Energy Transition:
An Energy Metabolism View of Global Agriculture Systems
by Sgouris Sgouridis & Denes Csala
*/

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
		var key = App.right(files[i], 7);
		key = App.left(key, 2);
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
	App.setQueryHash();
	var choice = App.getQueryHash();
	var calls = document.querySelector("input[name='r1']:checked");
	var callText = choice.call;
	if (calls) {
		// @ts-ignore
		callText = calls.title;
	}
	window.dispatchEvent(new CustomEvent("call-selection", { detail: { text: callText, value: choice.call }}));
	window.dispatchEvent(new CustomEvent("day-selection", { detail: { text: App.getScreenDate(choice.day), value: choice.day }}));

	// @ts-ignore
	config.padding = config.paddingmultiplier * (1 - config.densityslider.getValue()[0]) + 3;

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
				.alignHorizontal()
				.nodeWidth(30)
				// @ts-ignore
				.nodePadding(config.padding)
				.size([config.width, config.height]);

			config.sankey.nodes(ndata.nodes).links(ndata.links).layout(32);

			initSankeyNodeMovement(config);

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

			if (path) {
				var h = linkCollection.append("path") //path0
					.attr("d", path(0));
				var f = linkCollection.append("path") //path1
					.attr("d", path(1));
				var e = linkCollection.append("path") //path2
					.attr("d", path(2));
			}

			linkCollection
				// @ts-ignore
				.attr("fill", function (i) { return i.source.fill; })
				.attr("opacity", config.lowopacity)
				// @ts-ignore
				.on("click", function (d) {
					// @ts-ignore
					d3.event.stopPropagation();
					// @ts-ignore
					displayLinkBreakdown(this, d, config); 
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
						.on("dragstart", function (d) {
							// @ts-ignore
							this.parentNode.appendChild(this);
							// @ts-ignore
							d.initialPosition = d3.select(this).attr("transform");
						})
						// @ts-ignore
						.on("drag", b)
						// @ts-ignore
						.on("dragend", function(d) {
							// @ts-ignore
							if (d.initialPosition === d3.select(this).attr("transform")) {
								displayNodeBreakdown(d, config);
							}
						})
					);

			nodeCollection.append("rect")
				// @ts-ignore
				.attr("height", function (i) { return i.dy; })
				// @ts-ignore
				.attr("width", config.sankey.nodeWidth())
				// @ts-ignore
				.style("fill", function (i) { return i.color = i.fill; })
				// @ts-ignore
				.style("stroke", function (i) {	return d3.rgb(i.color).darker(2);	});

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
						return App.formatNumber(i.value);
					}
				});

			// @ts-ignore
			function b(i) { //dragmove
				if (config.sankey.allowMoveNodeY) {
					if (config.sankey.allowMoveNodeX) {
						// @ts-ignore
						d3.select(this)
							// @ts-ignore
							.attr("transform", "translate(" + (i.x = Math.max(0, Math.min(config.width - i.dx, d3.event.x))) + "," + (i.y = Math.max(0, Math.min(config.height - i.dy, d3.event.y))) + ")");
					} else {
						// @ts-ignore
						d3.select(this).attr("transform", "translate(" + i.x + "," + (i.y = Math.max(0, Math.min(config.height - i.dy, d3.event.y))) + ")");
					}
				} else {
					if (config.sankey.allowMoveNodeX) {
						// @ts-ignore
						d3.select(this)
							// @ts-ignore
							.attr("transform", "translate(" + (i.x = Math.max(0, Math.min(config.width - i.dx, d3.event.x))) + "," + i.y + ")");
					}
				}
				config.sankey.relayout();

				var path = config.sankey.reversibleLink();

				if (path) {
					f.attr("d", path(1));
					h.attr("d", path(0));
					e.attr("d", path(2));
				}
			}
		});
}

/**
 * 
 * @param {string} a 
 * @param {any} d 
 * @param {any} config
 */
function displayLinkBreakdown (a, d, config) {
	// @ts-ignore
	d3.select(".piechart.secondary")
		.style("display", "none");

	if (config.highlightedItem) {
		config.highlightedItem.style('opacity', config.lowopacity);
	}
	// @ts-ignore
	config.highlightedItem = d3.select(a);
	config.highlightedItem.style('opacity', config.highopacity);

	var tiptext = "<tr><td style='font-weight:bold;color:" + d.source.color;
	tiptext += ";'>" + d.source.name + "</td><td style='font-size:24px;'>→</td><td style='font-weight:bold;color:";
	tiptext += d.target.color + ";'>" + d.target.name + "</td></tr><tr><td>Calls</td><td>";
	tiptext += App.formatNumber(d.value) + "</td><td> Calls</td></tr>";
	
	// @ts-ignore
	var container = d3.select(".tooltip-charts");

	var h = parseInt(container.style("height"));
	var w = parseInt(container.style("width"));

	var containerPrimary = container.select(".piechart.primary");
	var svgPrimary = containerPrimary.select("svg");
	var containerSecondary = container.select(".piechart.secondary");
	var svgSecondary = containerSecondary.select("svg");

	svgPrimary.style("height", h + "px").style("width", w + "px");
	svgSecondary.style("height", h + "px").style("width", w + "px");

	// @ts-ignore
	setTimeout(function () {
		containerPrimary.style("display", null);
		svgPrimary.style("display", null);
		containerSecondary.style("display", "none");
		svgSecondary.style("display", "none");
		// @ts-ignore
		updatepie(eval(d.supply), containerPrimary, d.source.name, d.target.name, d.value);
	}, 500);

	var tipData = {
		chart: true,
		mouseX: d3.event.sourceEvent ? d3.event.sourceEvent.pageX : d3.event.pageX,
		text: tiptext
	};
	window.dispatchEvent(new CustomEvent("show-tip", { detail: tipData }));
	window.dispatchEvent(new CustomEvent("hide-menu"));
}

/**
 * 
 * @param {any} d 
 * @param {any} config
 */
function displayNodeBreakdown(d, config) {
	if (config.highlightedItem) {
		config.highlightedItem.style('opacity', config.lowopacity);
	}
	// @ts-ignore
	config.highlightedItem = config.svg.selectAll(".link")
		// @ts-ignore
		.filter(function (l) { return l.source == d || l.target == d; });
	
	config.highlightedItem.transition()
		.style('opacity', config.highopacity);
	
	// @ts-ignore
	var nodesource = [], nodetarget = [];

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
	tiptext += App.formatNumber(d3.sum(nodesource, function (d) { return d.v; }));
	tiptext += " Calls</td></tr><tr><td>Outgoing</td><td>";
	// @ts-ignore
	tiptext += App.formatNumber(d3.sum(nodetarget, function (d) { return d.v; })) + " Calls</td></tr>";
	
	// @ts-ignore
	var outin = App.formatNumber(d3.sum(nodetarget, function (d) { return d.v; }) / d3.sum(nodesource, function (d) { return d.v; }));
	// @ts-ignore
	if ((d3.sum(nodesource, function (d) { return d.v; }) == 0) || 
			// @ts-ignore
			(d3.sum(nodetarget, function (d) { return d.v;	}) == 0)) {
				outin = "--";
	}
	tiptext += "<tr><td>OUT / IN</td><td>" + outin + "</td></tr>";

	// @ts-ignore
	var container = d3.select(".tooltip-charts");

	var h = parseInt(container.style("height"));
	var w = parseInt(container.style("width"));

	var containerPrimary = container.select(".piechart.primary");
	var svgPrimary = containerPrimary.select("svg");
	var containerSecondary = container.select(".piechart.secondary");
	var svgSecondary = containerSecondary.select("svg");

	if (nodesource[0].l !== "None" && nodetarget[0].l !== "None") {
		svgPrimary.style("height", (h / 2) + "px").style("width", w + "px");
		svgSecondary.style("height", (h / 2) + "px").style("width", w + "px");
	} else {
		svgPrimary.style("height", h + "px").style("width", w + "px");
		svgSecondary.style("height", h + "px").style("width", w + "px");
	}

	// @ts-ignore
	setTimeout(function () {
		// @ts-ignore
		if (nodesource[0].l !== "None") {
			containerPrimary.style("display", null);
			svgPrimary.style("display", null);
			// @ts-ignore
			updatepie(nodesource, containerPrimary, "Incoming", d.name, d3.sum(nodesource, function (d) { return d.v; }));
		} else {
			containerPrimary.style("display", "none");
			svgPrimary.style("display", "none");
		}
		// @ts-ignore
		if (nodetarget[0].l !== "None") {
			containerSecondary.style("display", null);
			svgSecondary.style("display", null);
			// @ts-ignore
			updatepie(nodetarget, containerSecondary, d.name, "Outgoing", d3.sum(nodetarget, function (d) { return d.v;	}));
		} else {
			containerSecondary.style("display", "none");
			svgSecondary.style("display", "none");
		}
	}, 500);

	var tipData = {
		chart: true,
		mouseX: d3.event.sourceEvent ? d3.event.sourceEvent.pageX : d3.event.pageX,
		text: tiptext
	};
	window.dispatchEvent(new CustomEvent("show-tip", { detail: tipData }));
	window.dispatchEvent(new CustomEvent("hide-menu"));
}

// @ts-ignore
function updatepie(data, placeholder, placelabel1, placelabel2, pievalue) {
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

		var cx = parseInt(placeholder.style("width")) / 2
		var cy = parseInt(placeholder.style("height")) / 2 + 20;

		// @ts-ignore
		svg.datum(data).transition().duration(350).call(chart);

		// @ts-ignore
		svg.append("text")
			.transition().duration(400)
			.attr("x", cx)
			.attr("y", cy - 10)
			.attr("class", "centerpielabel")
			.text(placelabel1);

		// @ts-ignore
		svg.append("text")
			.transition().duration(400)
			.attr("x", cx)
			.attr("y", cy + 4)
			.attr("class", "centerpielabel")
			.text(placelabel2);

		var pietext = App.formatNumber(pievalue);
		// @ts-ignore
		svg.append("text")
			.transition().duration(400)
			.attr("x", cx)
			.attr("y", cy + 18)
			.attr("class", "centerpielabel")
			.text(pietext);

		return chart;
	});
}

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
			 .text(App.getScreenDate(key));
	}
	// @ts-ignore
	var toSelect = "0" + Math.max(Math.min(prevday, Math.max.apply(null, Object.keys(interpolatedall))), Math.min.apply(null, Object.keys(interpolatedall)));
	toSelect = App.right(toSelect, 4);
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

	// @ts-ignore
	day.on("click", function() { d3.event.stopPropagation(); })
	
	day.on("change", daychange);

	function daychange() {
		window.dispatchEvent(new CustomEvent("stp-selection", { detail: { text: stp.node().value, value: stp.node().value }}));
		var dayIndex = day.node().value - day.node().options[0].value + 1;
		// @ts-ignore
		d3.select("#timeslider")
			.select(".value")
			.text(App.getScreenDate(day.node().value));
		
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
				newValue = App.right(newValue, 4);
				// @ts-ignore
				d3.select("#timeslider")
					.select(".value")
					.text(App.getScreenDate(newValue));
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
function initSankeyNodeMovement(config) {
	if (!config.sankey) {
		console.error("Cannot set node movement behaviour on missing Sankey object");
	}
	var x = document.getElementById("xmove");
	var y = document.getElementById("ymove");
	if (x) {
		// @ts-ignore
		config.sankey.allowMoveNodeX = x.checked; 
		x.addEventListener("click", function(e) { e.stopImmediatePropagation(); });
		// @ts-ignore
		x.addEventListener("input", function(e) { config.sankey.allowMoveNodeX = x.checked; });
	}
	if (y) {
		// @ts-ignore
		config.sankey.allowMoveNodeY = y.checked;
		y.addEventListener("click", function(e) { e.stopImmediatePropagation(); });
		// @ts-ignore
		y.addEventListener("input", function(e) { config.sankey.allowMoveNodeY = y.checked; });
	}
}

/**
 * 
 * @param {any} config 
 */
function initMenu(config) {
  var menu = document.querySelector(".panel-right");
  var menuButton = document.querySelector(".panel-right-control");

  if (menu && menuButton) {
    menuButton.addEventListener("click", function(e) {
      e.stopImmediatePropagation();
      // @ts-ignore
      menu.classList.toggle("ready");
      window.dispatchEvent(new CustomEvent("hide-tip", { detail: config }));
    });
  }

  window.addEventListener("hide-menu", function() {
    // @ts-ignore
    menu.classList.add("ready");
  });
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
	var choice = App.getQueryHash();
	if (choice.stp) {
		stp.node().value = choice.stp;
	}

	// @ts-ignore
	stp.on("click", function() { d3.event.stopPropagation(); });

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
	var choice = App.getQueryHash();
	var parent = document.querySelector(".call-options");
	if (parent) {
		parent.innerHTML = "";
		// @ts-ignore
		var group = "", grpdiv, label, control;
		// @ts-ignore
		config.calls.forEach(function(call) {
			if (group !== call.group) {
				group = call.group;
				grpdiv = document.createElement("div");
				grpdiv.classList.add("panel-row");
				// @ts-ignore
				parent.appendChild(grpdiv);

				label = document.createElement("label");
				label.textContent = group;
				// @ts-ignore
				grpdiv.appendChild(label);

				control = document.createElement("div");
				// @ts-ignore
				grpdiv.appendChild(control);
			}
			var option = document.createElement("input");
			option.type = "radio";
			option.id = call.id;
			option.value = call.value;
			option.name = call.name;
			option.title = call.title;
			if (choice.call === option.value) {
				option.checked = true;
			}
			option.addEventListener("click", function(e) {
				e.stopImmediatePropagation();
				userSelectionChange(config);
			});
			// @ts-ignore
			control.appendChild(option);
		});
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
	var el = document.getElementById("pslider");
	if (el) {
		// @ts-ignore
		el.addEventListener("click", function(e) { e.stopImmediatePropagation(); });
	}
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
	var el = document.getElementById("oslider");
	if (el) {
		// @ts-ignore
		el.addEventListener("click", function(e) { e.stopImmediatePropagation(); });
	}
}

/**
 * Initialises various global event handlers
 * @param {any} config
 */
function initGlobalActions(config) {
	document.body.addEventListener("click", function(e) {
		e.stopImmediatePropagation();
		window.dispatchEvent(new CustomEvent("hide-tip", { detail: config }));
		window.dispatchEvent(new CustomEvent("hide-menu"));
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

/**
 * 
 * @param {any} config 
 */
function initTooltip(config) {
  // @ts-ignore
  var tooltipdiv = d3.select("body")
    .append("div")
      .attr("class", "tooltip left")
			.style("opacity", 0)
			.on("click", function () {
				// @ts-ignore
				d3.event.stopPropagation();
			});

	tooltipdiv.append("div")
		.classed("tooltip-close", true)
		.on("click", function () {
			// @ts-ignore
			d3.event.stopPropagation();
			tiphide(config);
		});

  var tooltiptext = tooltipdiv.append("div")
    .classed("tooltip message", true);

  var tooltipcharts = tooltipdiv.append("div")
    .classed("tooltip-charts", true)
    .style("height", Math.min(config.height - 100, config.width) + "px");
   
  tooltipcharts.append("div")
    .classed("piechart primary", true)
    .style("display", "none")
    .append("svg")
      .style("width", "200px")
      .style("height", "200px");

  tooltipcharts.append("div")
    .classed("piechart secondary", true)
    .style("display", "none")
    .append("svg")
      .style("width", "200px")
			.style("height", "200px");
		
	// @ts-ignore
	function tiphide (config) {
		// @ts-ignore
		tooltipdiv.transition()
			.duration(500)
			.style("opacity", 0)
			.style("z-index", -10);

		if (config.highlightedItem) {
			config.highlightedItem.style('opacity', config.lowopacity);
			config.highlightedItem = undefined;
		}
			
		// @ts-ignore
		tooltipcharts.selectAll("g").remove();
	}

	// @ts-ignore
	function tipshow (d) {
		// @ts-ignore
		if (d.mouseX > window.innerWidth * 0.5) {
			// @ts-ignore
			tooltipdiv.classed("right", false).classed("left", true);
		} else {
			// @ts-ignore
			tooltipdiv.classed("right", true).classed("left", false);
		}
	
		// @ts-ignore
		tooltipcharts.style("display", d.chart ? null : "none");
	
		// @ts-ignore
		tooltipdiv.transition()
			.duration(500)
			.style("opacity", 1)
			.style("z-index", 10);
	
		// @ts-ignore
		tooltiptext.html('<table style="text-align:center;">' + d.text + '</table>');
	}

  window.addEventListener("show-tip", function(e) {
    // @ts-ignore
    tipshow(e.detail);
  });
  
  window.addEventListener("hide-tip", function(e) {
    // @ts-ignore
    tiphide(config);
  });
}

// APPLICATION ENTRY POINT
var datapath = window.location.hostname === "localhost"
	? "./json/" 
	: "https://raw.githubusercontent.com/NELCSU/ED/master/docs/json/";

// @ts-ignore
d3.json(datapath + "config.json", function(d) {
	var config = d;
	config.environment = window.location.hostname === "localhost" ? "DEVELOPMENT" : "PRODUCTION";
	config.datapath = datapath;
	config.paddingmultiplier = 50;
	App.initTitleBar();
	initMenu(config);
	App.initUIThemes();
	initCallList(config);
	initDensitySlider(config);
	initOpacitySlider(config);
	App.initDataQualityChart();
	initCharts(config);
	initSTPList(config);
	var stp = document.getElementById("stp");
	if (stp) {
		stp.dispatchEvent(new Event("change"));
	}
	if (config.environment === "DEVELOPMENT") {
		var dev = document.querySelector(".dev-mode");
		if (dev) {
			dev.classList.remove("hide");
		}
	}
	initTooltip(config);
	initGlobalActions(config);
	App.updateSplash();
});