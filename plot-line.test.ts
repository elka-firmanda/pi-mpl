import assert from "node:assert/strict";
import test from "node:test";
import { PNG } from "pngjs";
import { MAX_POINTS, plotLine } from "./plot-line.ts";

test("renders a 640 × 480 PNG with the blue line crossing the plot", () => {
  const { width, height, data } = PNG.sync.read(plotLine([0, 1, 2], [0, 1, 2]));
  assert.deepEqual([width, height], [640, 480]);

  for (const [x, y] of [[210, 340], [330, 240], [445, 150]]) {
    let bluePixels = 0;
    for (let row = y - 18; row <= y + 18; row++) {
      for (let col = x - 18; col <= x + 18; col++) {
        const i = (row * width + col) * 4;
        if (data[i] === 31 && data[i + 1] === 119 && data[i + 2] === 180 && data[i + 3] === 255) bluePixels++;
      }
    }
    assert.ok(bluePixels >= 20, `expected visible line near (${x}, ${y}), got ${bluePixels} blue pixels`);
  }
});

test("rejects empty, mismatched, non-finite, and oversized inputs", () => {
  assert.throws(() => plotLine([], []), /non-empty/);
  assert.throws(() => plotLine([0], [0, 1]), /same length/);
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.throws(() => plotLine([value], [0]), /finite numbers/);
    assert.throws(() => plotLine([0], [value]), /finite numbers/);
  }
  const oversized = Array<number>(MAX_POINTS + 1).fill(0);
  assert.throws(() => plotLine(oversized, oversized), /at most 10000 points/);
});
