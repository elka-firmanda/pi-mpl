import { Buffer } from "node:buffer";
import { subplots } from "mpl";

export const MAX_POINTS = 10_000;
export const MAX_GROUPS = 100;
export const MAX_BINS = 1_000;
export const MAX_LABEL_LENGTH = 80;
export const XY_TYPES = ["line", "step", "scatter", "bar", "barh"] as const;

type XY = { x: number[]; y: number[] };
type Chart =
  | (XY & { type: (typeof XY_TYPES)[number] })
  | (XY & { type: "fill_between" | "fill_betweenx"; baseline?: number | number[] })
  | (XY & { type: "errorbar"; error: number | number[] })
  | { type: "hist"; values: number[]; bins?: number }
  | { type: "boxplot"; values: number[][] }
  | { type: "pie"; values: number[]; labels?: string[] }
  | { type: "heatmap"; values: number[][] };

function checkVector(name: string, values: number[], max = MAX_POINTS) {
  if (!values.length) throw new Error(`${name} must be non-empty.`);
  if (values.length > max) throw new Error(`${name} may contain at most ${max} numbers.`);
  for (const value of values) {
    if (!Number.isFinite(value)) throw new Error(`${name} must contain only finite numbers.`);
  }
}

function checkMatrix(values: number[][], rectangular: boolean) {
  if (!values.length) throw new Error("values must be non-empty.");
  if (!rectangular && values.length > MAX_GROUPS) throw new Error(`values may contain at most ${MAX_GROUPS} groups.`);
  let remaining = MAX_POINTS;
  for (const row of values) {
    remaining -= row.length;
    if (remaining < 0) throw new Error(`values may contain at most ${MAX_POINTS} numbers in total.`);
    checkVector("Each row of values", row);
    if (rectangular && row.length !== values[0]?.length) throw new Error("Heatmap rows must have the same length.");
  }
}

function checkPair(x: number[], y: number[]) {
  checkVector("x", x);
  checkVector("y", y);
  if (x.length !== y.length) throw new Error("x and y must have the same length.");
}

function checkExtra(name: string, value: number | number[], length: number) {
  if (Array.isArray(value)) {
    checkVector(name, value);
    if (value.length !== length) throw new Error(`${name} must have the same length as x and y.`);
  } else {
    checkVector(name, [value]);
  }
}

export function renderPlot(chart: Chart) {
  if ("x" in chart) checkPair(chart.x, chart.y);
  const [fig, ax] = subplots();
  switch (chart.type) {
    case "line": ax.plot(chart.x, chart.y); break;
    case "step": ax.step(chart.x, chart.y); break;
    case "scatter": ax.scatter(chart.x, chart.y); break;
    case "bar": ax.bar(chart.x, chart.y); break;
    case "barh": ax.barh(chart.y, chart.x); break;
    case "errorbar": {
      checkExtra("error", chart.error, chart.x.length);
      const errors = Array.isArray(chart.error) ? chart.error : [chart.error];
      if (errors.some(error => error < 0)) throw new Error("error must be non-negative.");
      ax.errorbar(chart.x, chart.y, { yerr: chart.error });
      break;
    }
    case "fill_between":
    case "fill_betweenx": {
      const baseline = chart.baseline ?? 0;
      checkExtra("baseline", baseline, chart.x.length);
      if (chart.type === "fill_between") ax.fill_between(chart.x, chart.y, baseline);
      else ax.fill_betweenx(chart.y, chart.x, baseline);
      break;
    }
    case "hist": {
      checkVector("values", chart.values);
      const bins = chart.bins ?? 10;
      if (!Number.isInteger(bins) || bins < 1 || bins > MAX_BINS) throw new Error(`bins must be an integer from 1 to ${MAX_BINS}.`);
      ax.hist(chart.values, { bins });
      break;
    }
    case "boxplot":
      checkMatrix(chart.values, false);
      ax.boxplot(chart.values);
      break;
    case "pie": {
      checkVector("values", chart.values, MAX_GROUPS);
      if (chart.values.some(value => value < 0)) throw new Error("Pie values must be non-negative.");
      const total = chart.values.reduce((sum, value) => sum + value, 0);
      if (!Number.isFinite(total) || total <= 0) throw new Error("Pie values must sum to a positive finite number.");
      const { labels } = chart;
      if (labels !== undefined) {
        if (labels.length !== chart.values.length) throw new Error("Provide one label per pie slice.");
        if (labels.some(label => typeof label !== "string" || !label.trim() || label.length > MAX_LABEL_LENGTH)) {
          throw new Error(`Pie labels must be non-blank strings of at most ${MAX_LABEL_LENGTH} characters.`);
        }
      }
      ax.pie(chart.values, { labels });
      break;
    }
    case "heatmap":
      checkMatrix(chart.values, true);
      fig.colorbar(ax.imshow(chart.values));
      break;
  }
  return Buffer.from(fig.toPNGSync());
}
