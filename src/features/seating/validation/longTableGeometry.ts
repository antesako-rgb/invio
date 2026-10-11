/** Counts are in local table coordinates: the long sides are top/bottom. */
export function getLongTableSeatCounts(capacity: number) {
  const ends = Math.min(4,capacity), remaining = capacity-ends;
  return { top:Math.ceil(remaining/2), right:Math.floor(ends/2), bottom:Math.floor(remaining/2), left:Math.ceil(ends/2) };
}

/** Eight seats form a square; the ninth starts a new column along the local width. */
export function getLongTableWidth(capacity: number, depth: number) {
  const counts = getLongTableSeatCounts(capacity);
  const columns = Math.max(2,counts.top,counts.bottom);
  return Math.ceil(depth+(columns-2)*depth/3);
}

/** Keep legacy short tables drawable until their capacity changes or they are standardized. */
export function getLongTableChairSpacing(capacity: number, width: number, depth: number) {
  const counts = getLongTableSeatCounts(capacity);
  return Math.min(depth/(Math.max(counts.left,counts.right)+1),
    width/(Math.max(counts.top,counts.bottom)+1));
}
