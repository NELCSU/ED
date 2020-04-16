import { getScreenDate } from "../../utils/format";
import type { TConfig } from "../../typings/ED";

/**
 * Initialises Data Quality chart
 * @param config
 */
export function initDataQualityChart(config: TConfig) {
  const container = document.getElementById("lblDQStatus") as HTMLDivElement;
  const status = container.querySelector("img") as HTMLImageElement;

  container.addEventListener("click", function (e) {
    e.stopImmediatePropagation();
    window.dispatchEvent(new CustomEvent("hide-menu"));
    const tipData = {
      chart: false,
      // @ts-ignore
      mouseX: 0,
      text: config.db.dq.text
    };
    window.dispatchEvent(new CustomEvent("show-breakdown", { detail: tipData }));
  });

  window.addEventListener("data-quality", () => {
    const i = config.db.dq.interpolated[config.querystring.day];
    const es = config.db.dq.estimated;
    const ms = config.db.dq.missing;
    let state = i.length + es.length + ms.length;
    status.src = state < 10 ? config.status.green.src : state < 15 ? config.status.amber.src : config.status.red.src;
    container.title = state < 10 ? config.status.green.title : state < 15 ? config.status.amber.title : config.status.red.title;
    let qt = `<p class="th-fg-color">Data availability for <b>${getScreenDate(config.querystring.day)}</b></p>`;
    qt += `<p><b class="th-fg-color">`;
    if (state === 0) {
      qt += `Complete</b> All data is available in the database.</p>`;
    } else if (state < 5) {
      qt += `Very High</b></p>`;
    } else if (state < 10) {
      qt += `High</b></p>`;
    } else if (state < 15) {
      qt += `Medium</b></p>`;
    } else if (state < 20) {
      qt += `Fair</b></p>`;
    } else {
      qt += `Low</b></p>`;
    }

    if (ms.length > 0) {
      qt += `<p><b class="th-fg-color">Missing data:</b> `;
      qt += JSON.stringify(ms)
        .replace(/\"/g, "")
        .replace(/\,/g, ", ")
        .replace(/\[/g, "")
        .replace(/\]/g, "") + ".</p>";
    }

    if (es.length > 0) {
      qt += `<p><b class="th-fg-color">Estimated data:</b> `;
      qt += JSON.stringify(es)
        .replace(/\"/g, "")
        .replace(/\,/g, ", ")
        .replace(/\[/g, "")
        .replace(/\]/g, "") + ".</p>";
    }

    if (i.length > 0) {
      qt += `<p><b class="th-fg-color">Interpolated data:</b><br>`;
      qt += JSON.stringify(i)
        .replace(/\"/g, "")
        .replace(/\,/g, ", ")
        .replace(/\[/g, "")
        .replace(/\]/g, "") + ".</p>";
    }
    config.db.dq.text = qt;
  });
}