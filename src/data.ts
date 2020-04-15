import { right } from "./utils/string";
import { getScreenDate } from "./utils/format";

/**
 * @param config 
 */
export async function fetchDayFile(config: any): Promise<string> {
  // @ts-ignore
  return JSZipUtils.getBinaryContent(
    config.datapath + config.filename, 
    function (err: any, rawdata: any) {
      // @ts-ignore
      return JSZip.loadAsync(rawdata)
        .then(function(zipfile: any) {
          const stp = document.getElementById("stp") as HTMLSelectElement;
          if (stp) {
            config.filename = stp.options[stp.selectedIndex].value + "m.json";
          }
          return zipfile.file(config.filename)
            .async("string")
            .then((content: Promise<string>) => {
              config.zip = zipfile;
              return Promise.resolve(content);
            });
        });
  });
}

/**
 * @param data 
 * @param config 
 */
export function processDayFile(data: string, config: any) {
  const file = JSON.parse(data);

  const dateStrings: string[] = [];
  for (let key in file.interpolated) {
    dateStrings.push(key);
  }

  window.dispatchEvent(new CustomEvent("day-list", { detail: dateStrings }));
  window.dispatchEvent(new CustomEvent("call-list"));

  const day = document.getElementById("day") as HTMLSelectElement;
	window.dispatchEvent(new CustomEvent("data-quality", { detail: {
		day: day.value,
		estimated: file.estimated,
		interpolated: file.interpolated, 
		missing: file.missing, 
	}}));

  // @ts-ignore
	const stp = d3.select("#stp");

  // @ts-ignore
	window.dispatchEvent(new CustomEvent("stp-selection", { detail: { text: stp.node().value, value: stp.node().value }}));

  // @ts-ignore
	day.addEventListener("click", function(e) { e.stopImmediatePropagation(); });
	
	day.addEventListener("change", daychange);

	function daychange() {
    // @ts-ignore
		window.dispatchEvent(new CustomEvent("stp-selection", { detail: { text: stp.node().value, value: stp.node().value }}));
    let dayIndex = parseInt(day.value) - parseInt(day.options[0].value) + 1;
    
    // @ts-ignore
		d3.select("#timeslider")
			.select(".value")
			.text(getScreenDate(day.value));
		
		let dv = day.options.length - 1;
		if (dv < 1) {
			dv = 1;
		}
		dayIndex = dayIndex < 2 ? 1 : dayIndex - 1;
		config.timedragdealer.setValue(dayIndex / dv, 0, false);
  }
  
  if (!config.timedragdealer) { //initialize timeslider on first iteration
    // @ts-ignore
		config.timedragdealer = new Dragdealer("timeslider", {
			x: 0,
			steps: 100, //day.node().length,
			// @ts-ignore
			animationCallback: function (a, b) {
				const firstValue = parseInt(day.options[0].value);
				const lastValue = parseInt(day.options[day.options.length - 1].value);
				let newValue = "0" + (firstValue + Math.round(a * (lastValue - firstValue)));
				newValue = right(newValue, 4);
				// @ts-ignore
				d3.select("#timeslider")
					.select(".value")
					.text(getScreenDate(newValue));
			},
			// @ts-ignore
			callback: function (a, b) {
				let dayIndex = Math.round(a * (day.options.length - 1));
				if (dayIndex < 1 || isNaN(dayIndex)) {
					dayIndex = 0;
				}
        day.selectedIndex = dayIndex;
        // @ts-ignore
				userSelectionChange(config);
			}
		});
  }
  
	//reset step scale on other iterations
	const x = [];
  let i = 0;
  
  // @ts-ignore
	while (x.push(i++/(day.options.length-1)) < day.options.length);
	// @ts-ignore
  config.timedragdealer.stepRatios = x;
  
	daychange(); //initialize & trigger change in main sankey
}