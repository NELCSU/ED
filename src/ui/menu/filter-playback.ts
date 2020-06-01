
import type { TConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initPlayback(config: TConfig) {
	const playShowHide = document.getElementById("PlaybackShowHide") as HTMLInputElement;

	playShowHide.addEventListener("input", (e: Event) => {
		config.filters.playback = +(e.target as HTMLInputElement).checked ? true : false;
		window.dispatchEvent(new CustomEvent("filter-action"));
	});
}