import type { TConfig } from "../typings/ED";

/**
 * @param config 
 */
export function initEnvironment(config: TConfig) {
  config.environment = window.location.hostname === "localhost" ? "DEVELOPMENT" : "PRODUCTION";
}