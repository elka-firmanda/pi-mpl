# Pi plot_line

A single tool for Pi 1.6.0 on Node.js 24+. `plot_line` takes numeric `x` and `y` arrays and returns a PNG chart inline on image-capable terminals. Both arrays must have the same length and contain **1–10,000 finite numbers each**. MPL is pinned to `8befb5cd`.

```sh
npm ci
npm test
pi -e ./index.ts
```

If npm 11 rejects your user-level `allow-scripts` setting while preparing the Git dependency, try `NPM_CONFIG_USERCONFIG=/dev/null npm ci`. This does not change your npm configuration.

To install for automatic discovery, put `index.ts`, `plot-line.ts`, `package.json`, and `package-lock.json` in a new `~/.pi/agent/extensions/plot-line/` directory, run `npm ci --omit=dev` there, and start a fresh Pi session.

Try: “Use `plot_line` with x=[0,1,2,3,4] and y=[0,1,4,9,16] and show me the chart.”
