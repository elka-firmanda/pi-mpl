import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { MAX_BINS, MAX_GROUPS, MAX_POINTS, renderPlot, XY_TYPES } from "./plot.ts";

const vector = Type.Array(Type.Number(), { minItems: 1, maxItems: MAX_POINTS });
const xy = { x: vector, y: vector };
const scalarOrVector = Type.Union([Type.Number(), vector]);
const closed = { additionalProperties: false };

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "plot",
    label: "Plot",
    description: `Render an MPL chart as a PNG. Supply chart.type and its data. Only finite numbers; at most ${MAX_POINTS} numbers per array or matrix, and paired arrays must have equal length. For barh, x holds widths; for errorbar, error holds symmetric y errors.`,
    parameters: Type.Object({
      chart: Type.Union([
        Type.Object({ type: Type.Union(XY_TYPES.map(type => Type.Literal(type))), ...xy }, closed),
        Type.Object({ type: Type.Union([Type.Literal("fill_between"), Type.Literal("fill_betweenx")]), ...xy, baseline: Type.Optional(scalarOrVector) }, closed),
        Type.Object({ type: Type.Literal("errorbar"), ...xy, error: scalarOrVector }, closed),
        Type.Object({ type: Type.Literal("hist"), values: vector, bins: Type.Optional(Type.Integer({ minimum: 1, maximum: MAX_BINS })) }, closed),
        Type.Object({ type: Type.Literal("boxplot"), values: Type.Array(vector, { minItems: 1, maxItems: MAX_GROUPS }) }, closed),
        Type.Object({ type: Type.Literal("pie"), values: Type.Array(Type.Number(), { minItems: 1, maxItems: MAX_GROUPS }) }, closed),
        Type.Object({ type: Type.Literal("heatmap"), values: Type.Array(vector, { minItems: 1, maxItems: MAX_POINTS }) }, closed),
      ]),
    }, closed),
    async execute(_id, { chart }) {
      const png = renderPlot(chart);
      return {
        content: [{ type: "image", mimeType: "image/png", data: png.toString("base64") }],
        details: {},
      };
    },
  });
}
