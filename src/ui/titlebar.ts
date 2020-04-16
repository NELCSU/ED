/**
 * Renders title bar components
 */
export function initTitleBar() {
  const org = document.getElementById("lblOrganisationStatus") as HTMLDivElement;
  const day = document.getElementById("lblDayStatus") as HTMLDivElement;
  const call = document.getElementById("lblCallStatus") as HTMLDivElement;
  
  window.addEventListener("org-selected", (e: any) => org.textContent = e.detail + " |");
  window.addEventListener("day-selected", (e: any) => day.textContent = e.detail + " |");
  window.addEventListener("call-selected", (e: any) => call.textContent = e.detail);
}