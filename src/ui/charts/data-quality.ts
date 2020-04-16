import { getScreenDate } from "../../utils/format";

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
 * @param config 
 */
function draw (config: any) {
  const i = config.db.dq.interpolated[config.querystring.day];
  const es = config.db.dq.estimated;
  const ms = config.db.dq.missing;
  const q = document.getElementById("quality") as HTMLDivElement;
  let qt = "<table style='font-size:12px;'><tr><td style='border-bottom:solid 1px #888;'>Data availability for <b>";
  if (q) {
    qt += getScreenDate(config.querystring.day) + ": </b>";
    if ((i.length < 1) && (ms.length < 1) && (es.length < 1)) {
      q.textContent = "▪▪▪▪▪▪▪▪▪▪";
      qt += "<b style='color:#2a2;'>Complete</b></td></tr><tr><td>All data is available in the database.</td></tr>";
    } else {
      q.textContent = "▪▪▪▪▪▪▪▪▪▫";
      if ((i.length + es.length < 3) && (ms.length < 3)) {
        qt += "<b style='color:#2a2;'>Very High</b></td></tr>";
      } else if ((i.length + es.length < 5) && (ms.length < 1)) {
        qt += "<b style='color:#2a2;'>Very High</b></td></tr>";
      } else if ((i.length + es.length < 7) && (ms.length < 1)) {
        q.textContent = "▪▪▪▪▪▪▪▪▫▫";
        qt += "<b style='color:#2a2;'>High</b></td></tr>";
      } else if ((i.length + es.length < 5) && (ms.length < 3)) {
        q.textContent = "▪▪▪▪▪▪▪▪▫▫";
        qt += "<b style='color:#2a2;'>High</b></td></tr>";
      } else if ((i.length + es.length < 3) && (ms.length < 5)) {
        q.textContent = "▪▪▪▪▪▪▪▪▫▫";
        qt += "<b style='color:#2a2;'>High</b></td></tr>";
      } else if ((i.length + es.length < 5) && (ms.length < 5)) {
        q.textContent = "▪▪▪▪▪▪▪▫▫▫";
        q.style.color = "#ff6600";
        qt += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((i.length + es.length < 7) && (ms.length < 3)) {
        q.textContent = "▪▪▪▪▪▪▪▫▫▫";
        q.style.color = "#ff6600";
        qt += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((i.length + es.length < 9) && (ms.length < 1)) {
        q.textContent = "▪▪▪▪▪▪▪▫▫▫";
        q.style.color = "#ff6600";
        qt += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((i.length + es.length < 11) && (ms.length < 1)) {
        q.textContent = "▪▪▪▪▪▪▫▫▫▫";
        q.style.color = "#ff6600";
        qt += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((i.length + es.length < 9) && (ms.length < 3)) {
        q.textContent = "▪▪▪▪▪▪▫▫▫▫";
        q.style.color = "#ff6600";
        qt += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((i.length + es.length < 7) && (ms.length < 5)) {
        q.textContent = "▪▪▪▪▪▪▫▫▫▫";
        q.style.color = "#ff6600";
        qt += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((i.length + es.length < 5) && (ms.length < 7)) {
        q.textContent = "▪▪▪▪▪▪▫▫▫▫";
        q.style.color = "#ff6600";
        qt += "<b style='color:#f60;'>Medium</b></td></tr>";
      } else if ((i.length + es.length < 13) && (ms.length < 1)) {
        q.textContent = "▪▪▪▪▪▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((i.length + es.length < 11) && (ms.length < 3)) {
        q.textContent = "▪▪▪▪▪▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((i.length + es.length < 9) && (ms.length < 5)) {
        q.textContent = "▪▪▪▪▪▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'" + ">Fair</b></td></tr>";
      } else if ((i.length + es.length < 9) && (ms.length < 7)) {
        q.textContent = "▪▪▪▪▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((i.length + es.length < 11) && (ms.length < 5)) {
        q.textContent = "▪▪▪▪▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((i.length + es.length < 13) && (ms.length < 3)) {
        q.textContent = "▪▪▪▪▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((i.length + es.length < 15) && (ms.length < 1)) {
        q.textContent = "▪▪▪▪▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Fair</b></td></tr>";
      } else if ((i.length + es.length < 17) && (ms.length < 1)) {
        q.textContent = "▪▪▪▫▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Low</b></td></tr>";
      } else if ((i.length + es.length < 15) && (ms.length < 3)) {
        q.textContent = "▪▪▪▫▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Low</b></td></tr>";
      } else if ((i.length + es.length < 13) && (ms.length < 5)) {
        q.textContent = "▪▪▪▫▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'>Low</b></td></tr>";
      } else if ((i.length + es.length < 11) && (ms.length < 7)) {
        q.textContent = "▪▪▪▫▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
      } else {
        q.textContent = "▪▪▫▫▫▫▫▫▫▫";
        q.style.color = "#D90000";
        qt += "<b style='color:#D90000;'" + ">Low</b></td></tr>";
      }

      if (ms.length > 0) {
        qt += "<tr><td><b>Missing data:</b></td></tr><tr><td>";
        qt += JSON.stringify(ms)
          .replace(/\"/g, "")
          .replace(/\,/g, "</td></tr><tr><td>")
          .replace(/\[/g, "")
          .replace(/\]/g, "") + "</td></tr>";
      }

      if (es.length > 0) {
        qt += "<tr><td><b>Estimated data:</b></td></tr><tr><td>";
        qt += JSON.stringify(es)
          .replace(/\"/g, "")
          .replace(/\,/g, "</td></tr><tr><td>")
          .replace(/\[/g, "")
          .replace(/\]/g, "") + "</td></tr>";
      }

      if (i.length > 0) {
        qt += "<tr><td><b>Interpolated data:</b></td></tr><tr><td>";
        qt += JSON.stringify(i)
          .replace(/\"/g, "")
          .replace(/\,/g, "</td></tr><tr><td>")
          .replace(/\[/g, "")
          .replace(/\]/g, "") + "</td></tr>";
      }
    }
    qt += "</table>";
  }
  q.dataset.tip = qt;
}

/**
 * Initialises Data Quality chart
 * @param config
 */
export function initDataQualityChart(config: any) {
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
        const d = {
          chart: false, 
          x: 10, 
          y: e.clientY + 50, 
          text: quality.dataset.tip 
        };
        window.dispatchEvent(new CustomEvent("show-breakdown", { detail: d }));
      }
    });
  }

  window.addEventListener("data-quality", () => draw(config));
}