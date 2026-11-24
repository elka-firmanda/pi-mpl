import { subplots } from "mpl";

export const MAX_POINTS = 10_000;

export function plotLine(x: number[], y: number[]) {
  if (!x.length || !y.length) throw new Error("x and y must be non-empty arrays.");
  if (x.length !== y.length) throw new Error("x and y must have the same length.");
  if (x.length > MAX_POINTS) throw new Error(`x and y may contain at most ${MAX_POINTS} points each.`);
  for (let i = 0; i < x.length; i++) {
    if (!Number.isFinite(x[i]) || !Number.isFinite(y[i])) {
      throw new Error(`x and y must contain only finite numbers (index ${i}).`);
    }
  }

  const [fig, ax] = subplots();
  ax.plot(x, y);
  return Buffer.from(fig.toPNGSync());
}
