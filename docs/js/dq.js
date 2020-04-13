/**
 * Appends <td> to parent, returns DOM node
 * @param {HTMLTableRowElement} parent 
 */
function td(parent) {
  var cell = document.createElement("td");
  parent.appendChild(cell);
  return cell;
}

/**
 * Appends <tr> to parent, returns DOM node
 * @param {HTMLTableElement} parent 
 */
function tr(parent) {
  var row = document.createElement("tr");
  parent.appendChild(row);
  return row;
}

/**
 * 
 * @param {{day: any, estimated: any, interpolated: any, missing: any}} data 
 */
function drawDataQualityChart (data) {
	var interpolated = data.interpolated[data.day];
	// @ts-ignore
	var quality = d3.select("#quality");

  var qualitytooltip = "<table style='font-size:12px;'><tr><td style='border-bottom:solid 1px #888;'>Data availability for <b>";
  qualitytooltip += data.day + ": </b>";
	if ((interpolated.length < 1) && (data.missing.length < 1) && (data.estimated.length < 1)) {
		quality.text("▪▪▪▪▪▪▪▪▪▪");
		qualitytooltip += "<b style='color:#2a2;'>Complete</b></td></tr><tr><td>All data is available in the database.</td></tr>";
	} else {
		if ((interpolated.length + data.estimated.length < 3) && (data.missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▪▫");
			qualitytooltip += "<b style='color:#2a2;'>Very High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▪▫");
			qualitytooltip += "<b style='color:#2a2;'>Very High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 7) && (data.missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▫▫");
			qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▫▫");
			qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 3) && (data.missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▪▫▫");
			qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 5) & (data.missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 7) & (data.missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 9) & (data.missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▪▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 11) & (data.missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 9) & (data.missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 7) & (data.missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 5) & (data.missing.length < 7)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▪▫▫▫▫").style("color", "#f60");
			qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 13) & (data.missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 11) & (data.missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 9) & (data.missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▪▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 9) & (data.missing.length < 7)) {
			// @ts-ignore
			quality.text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 11) & (data.missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 13) & (data.missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 15) & (data.missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▪▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 17) & (data.missing.length < 1)) {
			// @ts-ignore
			quality.text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 15) & (data.missing.length < 3)) {
			// @ts-ignore
			quality.text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 13) & (data.missing.length < 5)) {
			// @ts-ignore
			quality.text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip +=  "<b style='color:#D90000;'>Low</b></td></tr>";
		// @ts-ignore
		} else if ((interpolated.length + data.estimated.length < 11) & (data.missing.length < 7)) {
			// @ts-ignore
			quality.text("▪▪▪▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
		} else {
			// @ts-ignore
			quality.text("▪▪▫▫▫▫▫▫▫▫").style("color", "#D90000");
			qualitytooltip += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
		}

		if (data.missing.length > 0) {
			qualitytooltip += "<tr><td><b>Missing data:</b></td></tr><tr><td>";
			qualitytooltip += JSON.stringify(data.missing)
				.replace(/\"/g, "")
				.replace(/\,/g, "</td></tr><tr><td>")
				.replace(/\[/g, "")
				.replace(/\]/g, "") + "</td></tr>";
		}

		if (data.estimated.length > 0) {
			qualitytooltip += "<tr><td><b>Estimated data:</b></td></tr><tr><td>";
			qualitytooltip += JSON.stringify(data.estimated)
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
	d3.select("#miniDQChart")
		.on("click", function () {
			// @ts-ignore
			d3.event.stopPropagation();
			window.dispatchEvent(new CustomEvent("hide-menu"));
			window.dispatchEvent(new CustomEvent("show-tip", { detail: { chart: false, text: qualitytooltip } }));
		});
}

function initDataQualityChart() {
  // @ts-ignore
  var container = document.getElementById("miniDQChart");
  if (container) {
    var tbl = document.createElement("table");
    tbl.classList.add("pagetitle", "th-fg-color", "data-quality");
    // @ts-ignore
    tbl.cellPadding = 0;
    // @ts-ignore
    tbl.cellSpacing = 0;
    container.appendChild(tbl);

    var row = tr(tbl);
    var cell = td(row);
    cell.textContent = "Data Availability";

    row = tr(tbl);
    cell = td(row);
    cell.id = "quality";
    cell.style.color = "#2a2";
  }

  window.addEventListener("data-quality", function(e) {
    // @ts-ignore
    drawDataQualityChart(e.detail);
  });
}

initDataQualityChart();