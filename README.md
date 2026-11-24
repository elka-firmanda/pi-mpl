# Pi MPL

`plot` is a single chart tool for Pi 1.6.0 on Node.js 24+. It renders a 640 × 480 PNG inline on image-capable terminals. MPL is pinned to `8befb5cd`.

```sh
npm ci
npm test
pi -e ./index.ts
```

If npm 11 rejects your user-level `allow-scripts` setting while preparing the Git dependency, try `NPM_CONFIG_USERCONFIG=/dev/null npm ci`. This does not change your npm configuration.

To install for automatic discovery, put `index.ts`, `plot.ts`, `package.json`, and `package-lock.json` in a new `~/.pi/agent/extensions/plot-line/` directory, run `npm ci --omit=dev` there, and start a fresh Pi session. If upgrading an existing copy, replace `index.ts` and `plot-line.ts` with `index.ts` and `plot.ts`. The old `plot_line` tool is no longer registered.

## Chart inputs

Pass a `chart` object with a `type` and the fields below. All data must be finite numbers. Vectors must contain 1–10,000 numbers; paired vectors must be the same length. Matrices may contain at most 10,000 numbers total, with no empty rows.

| `type` | Data |
| --- | --- |
| `line`, `step`, `scatter`, `bar` | `x` and `y` vectors |
| `barh` | `x` widths and `y` positions |
| `errorbar` | `x` and `y`, plus non-negative symmetric vertical `error` (scalar or one value per point) |
| `fill_between`, `fill_betweenx` | `x` and `y`, optional `baseline` (scalar or one value per point, default 0). The first fills vertically and the second horizontally. |
| `hist` | `values` vector and optional integer `bins` (1–1,000, default 10) |
| `boxplot` | `values` as a list of up to 100 groups; use `[[1, 2, 3]]` for one group |
| `pie` | `values` vector of up to 100 non-negative slices with a positive finite sum |
| `heatmap` | `values` as a rectangular matrix; rendered with `imshow` and a colorbar |

Try: “Use `plot` to make a heatmap with values `[[1, 4, 2], [3, 2, 5]]`.”

The tool covers the pinned MPL chart types, not its full styling, annotation, or subplot API.
