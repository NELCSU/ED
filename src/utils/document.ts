import type { TPoint } from "../typings/ED";

/**
 * Returns true if element is fully contained in the viewport
 * @param e - Element to test
 */
export function isInViewport(e: Element): boolean {
  const rect = e.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 
 * @param e - HTMLElement to retrieve size for
 * @param modifier - -1 = size, 0 = size + padding (default), 1 = size + padding + border, 2 = 
 */
export function size(e: HTMLElement, modifier: number = 0): TPoint {
  const h = e.clientHeight;
  const w = e.clientWidth;
  if (modifier === 0) {
    return { x: w, y: h };
  }
  const s = window.getComputedStyle(e);
  if (modifier === -1) {
    return {
      x: w - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight),
      y: h - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom)
    };
  }
  const oh = e.offsetHeight;
  const ow = e.offsetWidth;
  if (modifier === 1) {
    return { x: ow, y: oh };
  }
  return {
    x: ow + parseFloat(s.marginLeft) + parseFloat(s.marginRight),
    y: oh + parseFloat(s.marginTop) + parseFloat(s.marginBottom)
  };
}