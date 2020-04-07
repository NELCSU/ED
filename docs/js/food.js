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
 * @param {string} s
 */
function stripSpaces(s) { return s.replace(/\s/g, "-"); }

/***
 * Replace hyphens by spaces, for URL to TEXT
 * @param {string} s
 */
function addSpaces(s) {	return s.replace(/-/g, " "); }

//check if in dev mode and on local server
var datapath = window.location.hostname === "localhost"
	? "./" 
	: "https://raw.githubusercontent.com/NELCSU/ED/master/docs/";

// @ts-ignore
var missing;
// @ts-ignore
var estimated;
// @ts-ignore
var interpolatedall;
var zip = { files: {} };
// @ts-ignore
var color = d3.scale.category20();

/**
 * 
 * @param {number} a 
 */
function scrollsankey (a) {
	if (a < 0) {
		dayIndex = Math.min(dayselect.node().length, dayIndex + 1);
	} else {
		dayIndex = Math.max(1, dayIndex - 1);
	}
	timedragdealer.setValue((dayIndex - 1) / (dayselect.node().length - 1), 0, false);
};

/**
 * 
 * @param {string} filePath 
 */
function setdays(filePath) {
	// @ts-ignore
	JSZipUtils.getBinaryContent(filePath, function (err, rawdata) {
		// @ts-ignore
		zip = new JSZip(rawdata);
		// @ts-ignore
		var qdata = JSON.parse(zip.files[STPList.node().value + "m.json"].asText());
		missing = qdata.missing;
		estimated = qdata.estimated;
		interpolatedall = qdata.interpolated;

		dayselect.selectAll("option").remove();
		for (var key in interpolatedall) {
			dayselect.append("option").text(key);
		}

		// @ts-ignore
		dayselect.node().value = "0304"; // Math.max(Math.min(prevday, Math.max.apply(null, Object.keys(interpolatedall))), Math.min.apply(null, Object.keys(interpolatedall)));

		// @ts-ignore
		d3.select("#stp-in-title").text(STPList.node().value);

		//<!--SANKEY DIAGRAM-->

		dayselect.on("change", daychange);

		function daychange() {
			dayIndex = dayselect.node().value - dayselect.node().options[0].value + 1;
			// @ts-ignore
			d3.select("#timeslider").select(".value").text(parseInt(dayselect.node().value));
			timedragdealer.setValue((dayIndex - 1) / (dayselect.node().length - 1), 0, false);
		}

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
}

/**
 * 
 * @param {number[][]} interpolation 
 * @param {number[]} missing
 * @param {number[]} estimated
 */
function data_quality_info (interpolation, missing, estimated) {
	// @ts-ignore
	d3.select("#date-in-title").text(dayselect.node().value);

	var interpolated = interpolation[dayselect.node().value];
	// @ts-ignore
	var quality = d3.select("#quality").style("color", "#2a2");

	var qualitytooltip = "<table style='font-size:12px;'><tr><td style='border-bottom:solid 1px #888;'>Data availability for <b>" + dayselect.node().value + ": </b>";
	if ((interpolated.length < 1) && (missing.length < 1) && (estimated.length < 1)) {
		quality.text("▪▪▪▪▪▪▪▪▪▪");
		qualitytooltip += "<b style='color:#2a2;'>Complete</b></td></tr><tr><td>All data is available in the database.</td></tr>";
	} else {
		if ((interpolated.length + estimated.length < 3) && (missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▪▫");
			qualitytooltip += "<b style='color:#2a2;'>Very High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 5) && (missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▪▫");
			qualitytooltip += "<b style='color:#2a2;'>Very High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 7) && (missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▫▫");
			qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 5) && (missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▫▫");
			qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 3) && (missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▫▫");
			qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 5) & (missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 7) & (missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 9) & (missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 11) & (missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 9) & (missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 7) & (missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 5) & (missing.length < 7)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 13) & (missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 11) & (missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 9) & (missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 9) & (missing.length < 7)) {
			// @ts-ignore
			quality.text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 11) & (missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 13) & (missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 15) & (missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 17) & (missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 15) & (missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 13) & (missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip +=  "<b style='color:#D90000;'>Low</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + estimated.length < 11) & (missing.length < 7)) {
			// @ts-ignore
			quality.text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
		} else {
			// @ts-ignore
			quality.text("▪▪▫▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
		}

		if (missing.length > 0) {
			qualitytooltip += "<tr><td><b>Missing data:</b></td></tr><tr><td>";
			qualitytooltip += JSON.stringify(missing)
				.replace(/\"/g, "")
				.replace(/\,/g, "</td></tr><tr><td>")
				.replace(/\[/g, "")
				.replace(/\]/g, "") + "</td></tr>";
		}

		if (estimated.length > 0) {
			qualitytooltip += "<tr><td><b>Estimated data:</b></td></tr><tr><td>";
			qualitytooltip += JSON.stringify(estimated)
				.replace(/\"/g, "")
				.replace(/\,/g, "</td></tr><tr><td>")
				.replace(/\[/g, "")
				.replace(/\]/g, "") + "</td></tr>";
		}

		if (interpolated.length > 0) {
			qualitytooltip += "<tr><td><b>Interpolated data:</b></td></tr><tr><td>";
			qualitytooltip += JSON.stringify(interpolated)
				.replace(/\"/g, "")
				.replace(/\,/g, "</td></tr><tr><td>")
				.replace(/\[/g, "")
				.replace(/\]/g, "") + "</td></tr>";
		}
	}
	qualitytooltip = qualitytooltip + "</table>";
	// @ts-ignore
	d3.select("#qualitywrap")
		.on("mouseover", function () {
			tiptext = qualitytooltip;
			tipshow(null);
		})
		.on("mouseout", tiphide);
}

/**
 * 
 */
function change () {
	var a = STPList.node().value + dayselect.node().value;

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
	myhash = "&" + a.slice(a.length - 2, a.length) + "&" + dayselect.node().value + "&" + stripSpaces(STPList.node().value);
	window.location.hash = myhash;
	a3 = a.slice(a.length - 1, a.length);
	supplyselected = a3 == "3" ? true : false;

	// @ts-ignore
	if ((b30 && b30.checked) || (b31 && b31.checked) || (b32 && b32.checked) || (b33 && b33.checked)) {
		paddingmultiplier = 5;
	} else {
		paddingmultiplier = 50;
	}

	// @ts-ignore
	padding = paddingmultiplier * (1 - densityslider.getValue()[0]) + 3;

	// @ts-ignore
	data_quality_info(interpolatedall, missing, estimated);

	var pietooltip = 0;

	//<!--MAIN SANKEY-->
	// @ts-ignore
	var ndata = JSON.parse(zip.files[a + ".json"].asText());
	svg.selectAll("g").remove();

	// @ts-ignore
	sankey = d3.sankey().nodeWidth(30).nodePadding(padding).size([width, height]);
	sankey.nodes(ndata.nodes).links(ndata.links).layout(32);

	var linkCollection = svg.append("g")
		// @ts-ignore
		.selectAll(".link")
		.data(ndata.links)
		.enter()
		.append("g")
			.attr("class", "link")
			// @ts-ignore
			.sort(function (j, i) { return i.dy - j.dy;	});

	var h = linkCollection.append("path") //path0
		.attr("d", path(0));
	var f = linkCollection.append("path") //path1
		.attr("d", path(1));
	var e = linkCollection.append("path") //path2
		.attr("d", path(2));

	// @ts-ignore
	linkCollection.attr("fill", function (i) {
			return i.source.fill
				? i.source.fill
				: i.source.color = color(i.source.name.replace(/ .*/, ""));
		})
		.attr("opacity", lowopacity)
		// @ts-ignore
		.on("mouseover", function (d) { mouseovr(this, d); })
		// @ts-ignore
		.on("click", function (d) { mouseovr(this, d); })
		// @ts-ignore
		.on("mouseout", function (d) {
			// @ts-ignore
			d3.select(this)
				.style('opacity', lowopacity);
			// @ts-ignore
			window.clearTimeout(pietooltip);
			tiphide(d);
		});

	var nodeCollection = svg.append("g")
		.selectAll(".node")
		.data(ndata.nodes)
		.enter()
		.append("g")
			.attr("class", "node")
			// @ts-ignore
			.attr("transform", function (i) { return "translate(" + i.x + "," + i.y + ")"; })
			// @ts-ignore
			.call(d3.behavior.drag().origin(function (i) { return i; })
			// @ts-ignore
			.on("dragstart", function () { this.parentNode.appendChild(this);	})
			.on("drag", b));
		
	nodeCollection.append("rect")
		// @ts-ignore
		.attr("height", function (i) { return i.dy; })
		// @ts-ignore
		.attr("width", sankey.nodeWidth())
		// @ts-ignore
		.style("fill", function (i) {
			return i.fill
				? i.color = i.fill
				: i.color = color(i.name.replace(/ .*/, ""));
		})
		// @ts-ignore
		.style("stroke", function (i) {	return d3.rgb(i.color).darker(2);	})
		// @ts-ignore
		.on("mouseover", function (d) { mouseovr2(d);	})
		// @ts-ignore
		.on("click", function (d) {	mouseovr2(d);	})
		// @ts-ignore
		.on("mouseout", function (d) {
			svg.selectAll(".link")
					// @ts-ignore
					.filter(function (l) { return l.source == d || l.target == d;  })
					.transition()
					.style('opacity', lowopacity);

			window.clearTimeout(pietooltip);
			tiphide(null);
		})
		// @ts-ignore
		.on("dblclick", function (d) {
			// @ts-ignore
			svg.selectAll(".link")
					// @ts-ignore
					.filter(function (l) { return l.source == d; })
					.attr("display", function () {
						// @ts-ignore
						return d3.select(this).attr("display") === "none"
							? "inline"
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
			.filter(function (i) { return i.x < width / 2; })
			.attr("x", 6 + sankey.nodeWidth())
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
					if (i.value < 1) return format2(i.value);
					else if (i.value < 10) return format1(i.value);
					else return format(i.value);
				}
			});

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
	}

/**
 * 
 * @param {string} a 
 * @param {any} d 
 */
function mouseovr (a, d) {
	// @ts-ignore
	d3.select(a)
		.style('opacity', highopacity);

	tiptext = "<tr><td style='font-weight:bold;color:" + d.source.color + ";'>" + d.source.name + "</td><td style='font-size:24px;'>→</td><td style='font-weight:bold;color:" + d.target.color + ";'>" + d.target.name + "</td></tr><tr><td>Calls</td><td>" + format2(d.value) + "</td><td> Calls</td></tr>";
	
	tipshow(d);
	// @ts-ignore
	pietooltip = setTimeout(function () {
		hide("#mypie2");
		updatepie(eval(d.supply), "#mypie", d.source.name, d.target.name, d.value, true);
	}, 500);
}

/**
 * 
 * @param {any} d 
 */
function mouseovr2(d) {
	// @ts-ignore
	var nodesource = [], nodetarget = [];
	// @ts-ignore
	svg.selectAll(".link")
		// @ts-ignore
		.filter(function (l) { return l.source == d || l.target == d; })
		.transition()
		.style('opacity', highopacity);

	// @ts-ignore
	svg.selectAll(".link")
		// @ts-ignore
		.filter(function (l) { return l.target == d; })[0]
			// @ts-ignore
			.forEach(function (l) {
				nodesource.push(JSON.parse("{\"l\":\"" + l.__data__.source.name + "\", \"v\":" + l.__data__.value + "}"));
			});

	// @ts-ignore
	svg.selectAll(".link")
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

	tiptext = "<tr><td colspan=2 style='font-weight:bold;color:" + d.color + ";'>" + d.name;
	tiptext += "</td></tr><tr><td>Incoming</td><td>";
	// @ts-ignore
	tiptext += format2(d3.sum(nodesource, function (d) { return d.v; }));
	tiptext += " Calls</td></tr><tr><td>Outgoing</td><td>";
	// @ts-ignore
	tiptext += format2(d3.sum(nodetarget, function (d) { return d.v; })) + " Calls</td></tr>";
	
	// @ts-ignore
	var outin = format2(d3.sum(nodetarget, function (d) { return d.v; }) / d3.sum(nodesource, function (d) { return d.v; }));
	// @ts-ignore
	if ((d3.sum(nodesource, function (d) { return d.v; }) == 0) || 
			// @ts-ignore
			(d3.sum(nodetarget, function (d) { return d.v;	}) == 0)) {
				outin = "--";
	}
	tiptext += "<tr><td>OUT / IN</td><td>" + outin + "</td></tr>";

	tipshow(null);

	// @ts-ignore
	pietooltip = setTimeout(function () {
		show("#mypie2");
		// @ts-ignore
		updatepie(nodesource, "#mypie2", "Incoming", d.name, d3.sum(nodesource, function (d) { return d.v; }), false);
		// @ts-ignore
		updatepie(nodetarget, "#mypie", d.name, "Outgoing", d3.sum(nodetarget, function (d) { return d.v;	}), false);
	}, 500);
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
d3.select("#mypie2")
	.style("width", widepie / 2);
// @ts-ignore
d3.select("#mypie2")
	.style("margin-right", widepie / 2 + 10);

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

/**
 * 
 * @param {number[]} y 
 * @param {number[]} x 
 */
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
var STPList = d3.select("#stps");
// @ts-ignore
var dayselect = d3.select("#days");
var supplyselected = false;
var padding = 28;
var paddingmultiplier = 50;
var lowopacity = 0.3;
var highopacity = 0.7;
// @ts-ignore
var format2 = d3.format(",.2f"), format1 = d3.format(",.1f"), format = d3.format(",.0f");

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
var sankey2 = d3.sankey().nodeWidth(10).nodePadding(1).size([125, 50]);
// @ts-ignore
var timedragdealer = new Dragdealer();

document.addEventListener("keydown", function (event) {
	if ((event.keyCode == 27) || (event.keyCode >= 33 && event.keyCode <= 34) || (event.keyCode >= 37 && event.keyCode <= 40)) {
		switch (event.keyCode) {
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

/**
 * 
 * @param {any} d 
 */
function tipshow (d) {
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

/**
 * 
 * @param {any | undefined} d 
 */
function tiphide (d) {
	old = d;
	tooltipdiv.transition()
		.delay(300)
		.duration(200)
		.style("opacity", 0)
		.style("z-index", -10);
};

// @ts-ignore
d3.json(datapath + "json/stp.json", function (d) {
	STPList.selectAll("option").remove();

	for (var key in d.stp) {
		STPList.append("option").text(d.stp[key]);
	}

	if (stp) {
		STPList.node().value = stp;
	}
	STPList.on("change", sourcechange);

	setdays(datapath + "json/" + STPList.node().value + ".zip");

	function sourcechange() {
		prevday = dayselect.node().value;
		setdays(datapath + "json/" + STPList.node().value + ".zip");
	}
});