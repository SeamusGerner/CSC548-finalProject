import { moveItem, nextPosition } from './ordering';

describe('moveItem', () => {
  const days = ['Push', 'Pull', 'Legs'];

  it('moves an item up', () => {
    expect(moveItem(days, 1, -1)).toEqual(['Pull', 'Push', 'Legs']);
  });

  it('moves an item down', () => {
    expect(moveItem(days, 1, 1)).toEqual(['Push', 'Legs', 'Pull']);
  });

  it('leaves the list unchanged when moving the first item up', () => {
    expect(moveItem(days, 0, -1)).toEqual(days);
  });

  it('leaves the list unchanged when moving the last item down', () => {
    expect(moveItem(days, 2, 1)).toEqual(days);
  });

  it('ignores an out-of-range index', () => {
    expect(moveItem(days, 5, -1)).toEqual(days);
  });

  it('does not mutate the original list', () => {
    const original = [...days];
    moveItem(days, 0, 1);
    expect(days).toEqual(original);
  });
});

describe('nextPosition', () => {
  it('starts at 0 for an empty list', () => {
    expect(nextPosition([])).toBe(0);
  });

  it('goes after the highest position, even with gaps', () => {
    expect(nextPosition([0, 1, 4])).toBe(5);
  });
});
