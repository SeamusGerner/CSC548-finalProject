/**
 * Returns a copy of `items` with the item at `index` moved one step up (-1) or
 * down (+1). Out-of-range moves return the list unchanged.
 */
export function moveItem<T>(items: readonly T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return [...items];
  }
  const result = [...items];
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}

/** The position to give a new item appended after `positions` (0 for an empty list). */
export function nextPosition(positions: readonly number[]): number {
  return positions.length === 0 ? 0 : Math.max(...positions) + 1;
}
