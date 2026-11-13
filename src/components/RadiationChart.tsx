import { z } from "zod";
import raw from "../data/radlab.json";
export const radiationData = z
  .object({
    sourceUrl: z.url(),
    retrievedAt: z.string(),
    spacecraft: z.literal("ISS"),
    instrumentId: z.literal("DosTel1"),
    unit: z.literal("μGy/hour"),
    columns: z.array(z.string()),
    data: z
      .array(
        z.tuple([
          z.string(),
          z.literal("DosTel1"),
          z.number().nonnegative(),
          z.literal("ISS"),
        ]),
      )
      .min(1),
  })
  .parse(raw);
export default function RadiationChart() {
  const rows = radiationData.data;
  return (
    <figure className="radiation-chart">
      <figcaption>ISS DosTel1 · absorbed dose rate (μGy/hour)</figcaption>
      <svg
        viewBox="0 0 400 150"
        role="img"
        aria-label="Four archived readings decrease overall, from 9.82 to 6.23 microgray per hour."
      >
        <line x1="30" x2="380" y1="125" y2="125" stroke="#a9b79a" />
        <polyline
          fill="none"
          stroke="#466a43"
          strokeWidth="3"
          points={rows
            .map((r, i) => `${30 + i * 110},${125 - r[2] * 9}`)
            .join(" ")}
        />
        {rows.map((r, i) => (
          <g key={r[0]}>
            <circle
              cx={30 + i * 110}
              cy={125 - r[2] * 9}
              r="4"
              fill="#466a43"
            />
            <text
              x={30 + i * 110}
              y={112 - r[2] * 9}
              textAnchor="middle"
              fontSize="12"
              fill="#263d32"
            >
              {r[2].toFixed(2)}
            </text>
            <text
              x={30 + i * 110}
              y="145"
              textAnchor="middle"
              fontSize="11"
              fill="#43583a"
            >
              Reading {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <p>
        Readings are shown in observation order; spacing is not elapsed time.
      </p>
      <details>
        <summary>Read the original measurements</summary>
        <table>
          <caption>Archived instrument readings; source timestamps</caption>
          <thead>
            <tr>
              <th>Time</th>
              <th>μGy/hour</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                <td>{r[0]}</td>
                <td>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <a href={radiationData.sourceUrl} target="_blank" rel="noreferrer">
          Exact API query
        </a>
      </details>
    </figure>
  );
}
