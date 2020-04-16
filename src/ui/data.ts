import { updateCallList } from "../ui/menu/filter-call";
import { updateDayList } from "./menu/filter-day";
import { setQueryHash } from "../ui/urlhash";

/**
 * @param config 
 */
export async function fetchDataStore(config: any): Promise<any> {
	const p = (file: string) => {
		return new Promise((resolve, reject) => {
			// @ts-ignore
			JSZipUtils.getBinaryContent(file, (err: any, rawdata: any) => {
					if (err) {
						reject(err);
					}
					resolve(rawdata);
			});
		});
	};
	
	return p(config.db.path + config.db.file)
		.then(async raw => {
			// @ts-ignore
			return await JSZip.loadAsync(raw);
		})
		.then((zipfile: any) => {
			config.db.zip = zipfile;
			return zipfile;
		});
}

/**
 * @param config
 */
export async function openDataFile(config: any): Promise<string> {
	return config.db.zip.file(config.db.file).async("string");
}

/**
 * @param data 
 * @param config 
 */
export function processDayFile(data: string, config: any) {
  config.db.dq = JSON.parse(data);
  config.filters.days = [];
  for (let key in config.db.dq.interpolated) {
    config.filters.days.push(key);
	}
	window.dispatchEvent(new CustomEvent("data-quality"));
	updateDayList(config);
	updateCallList(config);
	setQueryHash(config);
	window.dispatchEvent(new CustomEvent("filter-action"));
}