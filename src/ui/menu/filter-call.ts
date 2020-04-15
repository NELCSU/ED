import { left, right } from "../../utils/string";
import { getQueryHash } from "../urlhash";

/**
 * Scans for first valid file and select corresponding call menu choice
 * @param config
 */
export function setDefaultCall(config: any) {	
	const files = Object.keys(config.zip.files);
	let ctrl: HTMLInputElement | null;
	config.calls.forEach(function(call: any) {
		ctrl = document.getElementById(call.id) as HTMLInputElement;
		if (ctrl) {
			ctrl.disabled = true;
		}
	});
	let selected = false;
	for (let i = 0; i < files.length; i++) {
		let key = right(files[i], 7);
		key = left(key, 2);
		let found = config.calls.findIndex(function(e: any) { return e.value === key; });
		if (found > -1) {
			ctrl = document.getElementById(config.calls[found].id) as HTMLInputElement;
			if (ctrl) {
				ctrl.disabled = false;
				if (!selected) {
					ctrl.checked = true;
					selected = true;
				}
			}			
		}
	}
}

/**
 * @param config 
 */
export function initCallList(config: any) {
	const choice = getQueryHash();
	const parent = document.querySelector(".call-options") as HTMLDivElement;
	if (parent) {
		parent.innerHTML = "";
    let group = "", grpdiv, label;
    let control: HTMLDivElement;
		config.calls.forEach(function(call: any) {
			if (group !== call.group) {
				group = call.group;
				grpdiv = document.createElement("div");
				grpdiv.classList.add("panel-row");
				parent.appendChild(grpdiv);

				label = document.createElement("label");
				label.textContent = group;
				grpdiv.appendChild(label);

				control = document.createElement("div");
				grpdiv.appendChild(control);
			}
			let option = document.createElement("input") as HTMLInputElement;
			option.type = "radio";
			option.id = call.id;
			option.value = call.value;
			option.name = call.name;
			option.title = call.title;
			if (choice.call === option.value) {
				option.checked = true;
			}
			option.addEventListener("click", function(e) {
				e.stopImmediatePropagation();
				window.dispatchEvent(new CustomEvent("filter-action", { detail: config }));
			});
			control.appendChild(option);
		});
	}

	window.addEventListener("call-list", () => setDefaultCall(config));
}