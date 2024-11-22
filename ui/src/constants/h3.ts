/* eslint-disable */
export const ZOOM_H3_RESOLUTION_PAIRS: [number, number][] = [
  [0, 1],
  [1, 1],
  [2, 2],
  [3, 3],
  [5, 4],
  [7, 5],
  [8, 5],
  [10, 6],
  [11, 7],
  [12, 8],
  [13, 9],
];

export const MINIMUM_ZOOM = Math.min(ZOOM_H3_RESOLUTION_PAIRS[0][0], 1);
// @ts-ignore
export const MAXIMUM_ZOOM = Math.max(ZOOM_H3_RESOLUTION_PAIRS.at(-1)[0], 16);