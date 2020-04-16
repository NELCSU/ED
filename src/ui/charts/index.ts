import { initBreakdown } from "./breakdown";
import { initDataQualityChart } from "./data-quality";
import { initSankeyChart } from "./sankey";

/**
 * @param config 
 */
export function initCharts(config: any) {
  initBreakdown(config);
  initDataQualityChart(config);
  initSankeyChart(config);
}