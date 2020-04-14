import type { TURLHash } from "../typings/ED";
import { addSpaces, stripSpaces } from "../utils/string";

/**
 * Returns TURLHash object with values from current URL hash value
 */
export function getQueryHash(): TURLHash {
	const re = /\w+\$[\w\-]+/gmi;
	let m, result = { call: "", day: "", stp: "" };
	while ((m = re.exec(window.location.hash)) !== null) {
		let p = m[0].split("$");
		// @ts-ignore
		switch(p[0]) {
			case "call": result.call = p[1]; break;
			case "day": result.day = p[1]; break;
			case "stp": result.stp = addSpaces(p[1]); break;
		}
	}
	return result;
}

/**
 * Sets the URL hash value based on UI element values
 */
export function setQueryHash() {
	const calls = document.querySelector("input[name='r1']:checked") as HTMLInputElement;
	const day = document.getElementById("day") as HTMLSelectElement;
	const stp = document.getElementById("stp") as HTMLSelectElement;
	let myhash = "";
	myhash = "call$" + calls.value + "+";
	myhash += "day$" + day.options[day.selectedIndex].value + "+";
	myhash += "stp$" + stripSpaces(stp.options[stp.selectedIndex].value);
	window.location.hash = myhash;
}