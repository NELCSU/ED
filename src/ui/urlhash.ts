import { addSpaces, stripSpaces } from "../utils/string";

/**
 * Returns TURLHash object with values from current URL hash value
 */
export function getQueryHash(config: any) {
	if (config.querystring === undefined) {
		config.querystring = { call: "", day: "", organisation: "" };
	}
	const re = /\w+\$[\w\-]+/gmi;
	let m;
	while ((m = re.exec(window.location.hash)) !== null) {
		let p = m[0].split("$");
		switch(p[0]) {
			case "call": config.querystring.call = p[1]; break;
			case "day": config.querystring.day = p[1]; break;
			case "stp": config.querystring.organisation = addSpaces(p[1]); break;
		}
	}
}

/**
 * Sets the URL hash value based on UI element values
 * @param config
 */
export function setQueryHash(config: any) {
	const call = document.querySelector("input[name='r1']:checked") as HTMLInputElement;
	const day = document.getElementById("Day") as HTMLInputElement;
	const org = document.getElementById("Organisation") as HTMLSelectElement;
	let myhash = "";
	if (call && call.value) {
		myhash = "call$" + call.value + "+";
	}
	if (day && config.filters.days) {
		myhash += "day$" + config.filters.days[day.value] + "+";
	}
	if (org && org.value) {
		myhash += "stp$" + stripSpaces(org.options[org.selectedIndex].value);
	}
	window.location.hash = myhash;
	getQueryHash(config);
}