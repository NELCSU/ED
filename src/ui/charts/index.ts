import { initBreakdown } from "./breakdown";
import { initDataQualityChart } from "./data-quality";
import { initSankeyChart } from "./sankey-chart";
import { initPlayback } from "./playback";
import type { TConfig } from "../../typings/ED";

/**
 * @param config 
 */
export function initCharts(config: TConfig) {
  initBreakdown(config);
  initDataQualityChart(config);
  initSankeyChart(config);
  initPlayback(config);
}