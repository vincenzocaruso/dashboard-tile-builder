export function sortLayout(a: Dashboard.Layout, b: Dashboard.Layout): number {
  // handle possible bad saves
  if (!a) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  // sort by layout order
  return a.x === b.x ? a.y - b.y : a.x - b.x;
}