import { expect, it } from "vitest";
import { evidence, evidenceSchema } from "../src/data/evidence";
import { radiationData } from "../src/components/RadiationChart";
import osdr from "../src/data/osdr-candidate.json";
it("ships unique reviewed sources with traceable URLs and explicit limitations", () => {
  expect(new Set(evidence.map((x) => x.id)).size).toBe(evidence.length);
  evidence.forEach((item) => {
    expect(evidenceSchema.safeParse(item).success).toBe(true);
    expect(item.limitations.length).toBeGreaterThan(30);
  });
  expect(
    evidence.find((x) => x.id === "donki-flare")?.originalFields.classType,
  ).toBe("X3.9");
});
it("keeps measured radiation units and one instrument context intact", () => {
  expect(radiationData.data).toHaveLength(4);
  expect(radiationData.data[0]).toEqual([
    "2022-04-01T23:00:00",
    "DosTel1",
    9.815504,
    "ISS",
  ]);
  expect(radiationData.unit).toBe("μGy/hour");
  expect(osdr.publications[0].doi).toBe("10.3390/ijms22020899");
  expect(osdr.reviewStatus).toBe("metadata-and-linked-publication-reviewed");
});
