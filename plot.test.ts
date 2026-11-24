import assert from "node:assert/strict";
import test from "node:test";
import { PNG } from "pngjs";
import { MAX_POINTS, renderPlot, XY_TYPES } from "./plot.ts";

const plotLine = (x: number[], y: number[]) => renderPlot({ type: "line", x, y });

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
  assert.throws(() => plotLine(oversized, oversized), /at most 10000 numbers/);
});

const xy = { x: [1, 2, 3], y: [2, 3, 4] };
const charts: Parameters<typeof renderPlot>[0][] = [
  ...XY_TYPES.filter(type => type !== "line").map(type => ({ type, ...xy })),
  { type: "errorbar", ...xy, error: [0.25, 0.5, 0.75] },
  { type: "fill_between", ...xy, baseline: [1, 1, 2] },
  { type: "fill_betweenx", ...xy },
  { type: "hist", values: [1, 2, 2, 3], bins: 3 },
  { type: "pie", values: [1, 2, 3] },
  { type: "boxplot", values: [[1, 2, 3], [3, 5, 7, 9]] },
  { type: "heatmap", values: [[1, 2], [3, 4]] },
];

for (const chart of charts) {
  test(`renders visible data for ${chart.type}`, () => {
    const { width, height, data } = PNG.sync.read(renderPlot(chart));
    assert.deepEqual([width, height], [640, 480]);
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== data[i + 1] || data[i] !== data[i + 2]) return;
    }
    assert.fail("expected colored chart marks, not just axes and labels");
  });
}

test("rejects invalid chart-specific inputs", () => {
  assert.throws(() => renderPlot({ type: "errorbar", ...xy, error: -1 }), /non-negative/);
  assert.throws(() => renderPlot({ type: "errorbar", ...xy, error: [1] }), /same length/);
  assert.throws(() => renderPlot({ type: "fill_betweenx", ...xy, baseline: Infinity }), /finite/);
  assert.throws(() => renderPlot({ type: "hist", values: [1], bins: 1001 }), /bins must be/);
  assert.throws(() => renderPlot({ type: "pie", values: [0] }), /positive finite/);
  assert.throws(() => renderPlot({ type: "pie", values: [-1, 2] }), /non-negative/);
  assert.throws(() => renderPlot({ type: "heatmap", values: [[1], [2, 3]] }), /same length/);
  assert.throws(() => renderPlot({ type: "boxplot", values: [[1], []] }), /non-empty/);
  assert.throws(() => renderPlot({ type: "heatmap", values: [Array<number>(MAX_POINTS).fill(1), [2]] }), /10000 numbers in total/);
});
