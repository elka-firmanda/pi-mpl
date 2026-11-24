import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { MAX_POINTS, plotLine } from "./plot-line.ts";

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "plot_line",
    label: "Plot line",
    description: `Plot paired numeric x and y arrays as a PNG line chart. Both arrays must have the same length, with 1–${MAX_POINTS} finite numbers each.`,
    parameters: Type.Object({
      x: Type.Array(Type.Number(), { minItems: 1, maxItems: MAX_POINTS }),
      y: Type.Array(Type.Number(), { minItems: 1, maxItems: MAX_POINTS }),
    }),
    async execute(_id, { x, y }) {
      const png = plotLine(x, y);
      return {
        content: [{ type: "image", mimeType: "image/png", data: png.toString("base64") }],
        details: {},
      };
    },
  });
}
