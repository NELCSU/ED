import { getQueryHash } from "../urlhash";
import { fetchDayFile, processDayFile } from "../../data";

/**
 * Updates the STP user control
 * @param config 
 */
export function initOrganisationList(config: any) {
  const stp = document.getElementById("stp") as HTMLSelectElement;
	stp.innerHTML = "";
	for (let key in config.stp) {
    const option = document.createElement("option");
    option.textContent = config.stp[key];
    stp.appendChild(option);
	}
	const choice = getQueryHash();
	if (choice.stp) {
    stp.value = choice.stp;
	}

	stp.addEventListener("click", e => e.stopImmediatePropagation());

	stp.addEventListener("change", () => {
		config.filename = stp.options[stp.selectedIndex].value + ".zip";
		fetchDayFile(config)
			.then(content => processDayFile(content, config));
  });
  
	if (stp) {
		stp.dispatchEvent(new Event("change"));
	}
}