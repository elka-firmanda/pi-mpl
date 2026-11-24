# Pi MPL

`plot` is a single chart tool for Pi 1.6.0 on Node.js 24+. It renders a 640 × 480 PNG inline on image-capable terminals. MPL is pinned to `8befb5cd`.

## Install

```sh
pi install git:github.com/elka-firmanda/pi-mpl
```

Start a fresh Pi session (or run `/reload`) to use `plot`. If you previously copied this extension into `~/.pi/agent/extensions/plot-line/`, move that manual copy outside the extensions folder to avoid registering `plot` twice.

If npm 11 reports `EALLOWSCRIPTS` while preparing the MPL Git dependency because of a user-level `allow-scripts` setting, retry with `NPM_CONFIG_USERCONFIG=/dev/null pi install git:github.com/elka-firmanda/pi-mpl`. This ignores your user npm config for that command only.

## Develop locally

```sh
npm ci
npm test
pi -e ./index.ts
```

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
| `pie` | `values` vector of up to 100 non-negative slices with a positive finite sum. Optional `labels` names the slices on the chart, in order (one non-blank label of up to 80 characters per slice). |
| `heatmap` | `values` as a rectangular matrix; rendered with `imshow` and a colorbar |

Try: “Use `plot` to make a pie chart with values `[1, 2, 3]` and slice labels `['One', 'Two', 'Three']`.”

The tool covers the pinned MPL chart types, not its full styling, annotation, or subplot API.
