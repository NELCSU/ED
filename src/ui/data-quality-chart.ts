import type { TDQChart } from "../typings/ED";

/**
 * Appends <td> to parent, returns DOM node
 * @param parent 
 */
function td (parent: HTMLTableRowElement): HTMLTableCellElement {
  const cell = document.createElement("td") as HTMLTableCellElement;
  parent.appendChild(cell);
  return cell;
}

/**
 * Appends <tr> to parent, returns DOM node
 * @param parent 
 */
function tr (parent: HTMLTableElement): HTMLTableRowElement {
  const row = document.createElement("tr") as HTMLTableRowElement;
  parent.appendChild(row);
  return row;
}

/**
 * @param data 
 */
function draw (data: TDQChart) {
	const interpolated = data.interpolated[data.day];	
  const quality = document.getElementById("quality") as HTMLDivElement;
  let qualitytooltip = "<table style='font-size:12px;'><tr><td style='border-bottom:solid 1px #888;'>Data availability for <b>";
  if (quality) {
    qualitytooltip += data.day + ": </b>";
    if ((interpolated.length < 1) && (data.missing.length < 1) && (data.estimated.length < 1)) {
      quality.textContent = "▪▪▪▪▪▪▪▪▪▪";
      qualitytooltip += "<b style='color:#2a2;'>Complete</b></td></tr><tr><td>All data is available in the database.</td></tr>";
    } else {
      quality.textContent = "▪▪▪▪▪▪▪▪▪▫";
      if ((interpolated.length + data.estimated.length < 3) && (data.missing.length < 3)) {
        qualitytooltip += "<b style='color:#2a2;'>Very High</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 1)) {
        qualitytooltip += "<b style='color:#2a2;'>Very High</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 7) && (data.missing.length < 1)) {
        quality.textContent = "▪▪▪▪▪▪▪▪▫▫";
        qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 3)) {
        quality.textContent = "▪▪▪▪▪▪▪▪▫▫";
        qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 3) && (data.missing.length < 5)) {
        quality.textContent = "▪▪▪▪▪▪▪▪▫▫";
        qualitytooltip += "<b style='color:#2a2;'>High</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 5)) {
        quality.textContent = "▪▪▪▪▪▪▪▫▫▫";
        quality.style.color = "#ff6600";
        qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 7) && (data.missing.length < 3)) {
        quality.textContent = "▪▪▪▪▪▪▪▫▫▫";
        quality.style.color = "#ff6600";
        qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 9) && (data.missing.length < 1)) {
        quality.textContent = "▪▪▪▪▪▪▪▫▫▫";
        quality.style.color = "#ff6600";
        qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 11) && (data.missing.length < 1)) {
        quality.textContent = "▪▪▪▪▪▪▫▫▫▫";
        quality.style.color = "#ff6600";
        qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 9) && (data.missing.length < 3)) {
        quality.textContent = "▪▪▪▪▪▪▫▫▫▫";
        quality.style.color = "#ff6600";
        qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 7) && (data.missing.length < 5)) {
        quality.textContent = "▪▪▪▪▪▪▫▫▫▫";
        quality.style.color = "#ff6600";
        qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 5) && (data.missing.length < 7)) {
        quality.textContent = "▪▪▪▪▪▪▫▫▫▫";
        quality.style.color = "#ff6600";
        qualitytooltip += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 13) && (data.missing.length < 1)) {
        quality.textContent = "▪▪▪▪▪▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 11) && (data.missing.length < 3)) {
        quality.textContent = "▪▪▪▪▪▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 9) && (data.missing.length < 5)) {
        quality.textContent = "▪▪▪▪▪▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 9) && (data.missing.length < 7)) {
        quality.textContent = "▪▪▪▪▫▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 11) && (data.missing.length < 5)) {
        quality.textContent = "▪▪▪▪▫▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 13) && (data.missing.length < 3)) {
        quality.textContent = "▪▪▪▪▫▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 15) && (data.missing.length < 1)) {
        quality.textContent = "▪▪▪▪▫▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 17) && (data.missing.length < 1)) {
        quality.textContent = "▪▪▪▫▫▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 15) && (data.missing.length < 3)) {
        quality.textContent = "▪▪▪▫▫▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 13) && (data.missing.length < 5)) {
        quality.textContent = "▪▪▪▫▫▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'>Low</b></td></tr>";
      } else if ((interpolated.length + data.estimated.length < 11) && (data.missing.length < 7)) {
        quality.textContent = "▪▪▪▫▫▫▫▫▫▫";
        quality.style.color = "#D90000";
        qualitytooltip += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
      } else {
        quality.textContent = "▪▪▫▫▫▫▫▫▫▫";
        quality.style.color = "#D90000";
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
    qualitytooltip += "</table>";
  }
  quality.dataset.tip = qualitytooltip;
}

/**
 * Initialises Data Quality chart
 */
export function initDataQualityChart() {
  const container = document.getElementById("miniDQChart") as HTMLDivElement;
  const tbl = document.createElement("table") as HTMLTableElement;
  if (container) {
    tbl.classList.add("pagetitle", "th-fg-color", "data-quality");
    tbl.cellPadding = "0";
    tbl.cellSpacing = "0";
    container.appendChild(tbl);

    let row = tr(tbl);
    let cell = td(row);
    cell.textContent = "Data Availability";

    row = tr(tbl);
    cell = td(row);
    cell.id = "quality";
    cell.style.color = "#2a2";

    container.addEventListener("click", function (e) {
      e.stopImmediatePropagation();
      window.dispatchEvent(new CustomEvent("hide-menu"));
      const quality = document.getElementById("quality") as HTMLDivElement;
      if (quality.dataset.tip) {
        window.dispatchEvent(new CustomEvent("show-tip", { detail: { chart: false, mouseX: e.clientX, text: quality.dataset.tip } }));
      }
    });
  }

  window.addEventListener("data-quality", (e: any) => draw(e.detail));
}