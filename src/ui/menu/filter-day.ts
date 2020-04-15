import { getScreenDate } from "../../utils/format";
import { right } from "../../utils/string";

export function initDayList() {
  const day = document.getElementById("day") as HTMLSelectElement;

  window.addEventListener("day-list", function(e: any) {
    day.innerHTML = "";
    let prevday: number = 0;
    e.detail.forEach((d: string, i: number) => {
      if (i === 0) {
        prevday = parseInt(d);
      }
      const option = document.createElement("option");
      option.value = d;
      option.textContent = getScreenDate(d);
    });

    let toSelect: string = "0" + Math.max(Math.min(prevday, Math.max.apply(null, e.detail)), Math.min.apply(null, e.detail));
    toSelect = right(toSelect, 4);
    day.value = toSelect;
  });
}