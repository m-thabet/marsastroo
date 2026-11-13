import { describe, expect, it } from "vitest";
import {
  commitTurn,
  defaultPlan,
  initialMission,
  previewTurn,
  type Plan,
  type Task,
} from "../src/domain/mission";
import { decodeSave } from "../src/infrastructure/storage";
const tasks: Task[] = [
  "research",
  "shelter",
  "fieldSample",
  "rest",
  "shelter",
  "research",
];
const base: Plan[] = tasks.map((task, i) => ({
  task,
  oxygenOn: [true, true, false, true, false, false][i],
  greenhouseOn: i < 2,
}));
function run(plans: Plan[]) {
  return plans.reduce((s, p) => commitTurn(s, p, s.turn), initialMission());
}
describe("documented strategies", () => {
  it("finishes the shelter path with exact projected reserves", () => {
    expect(run(base)).toMatchObject({
      status: "success",
      turn: 7,
      energy: 8,
      oxygen: 12,
      water: 2,
      food: 1,
      exposure: 10,
      research: 3,
      samples: 1,
    });
  });
  it("finishes the upgrade path", () => {
    const p = base.map((x) => ({ ...x }));
    [false, true, false, true].forEach((o, i) => {
      p[i + 1].oxygenOn = o;
    });
    p[3].task = "upgradeShield";
    expect(run(p)).toMatchObject({
      status: "success",
      energy: 3,
      exposure: 9,
      water: 2,
      samples: 1,
      shieldLevel: 1,
    });
  });
  it("can afford delayed advice and reveals it only next turn", () => {
    const p = base.map((x) => ({ ...x }));
    p[3].task = "askEarth";
    let s = run(p.slice(0, 3));
    expect(s.revealedHintIds).toEqual([]);
    s = commitTurn(s, p[3], 4);
    expect(s.turn).toBe(5);
    expect(s.revealedHintIds).toEqual(["turn-5"]);
    expect(s.pendingHint).toBeNull();
    expect(run(p)).toMatchObject({ status: "success", energy: 6 });
  });
});
describe("simulation boundaries", () => {
  it("does not mutate a preview and commits its exact projection", () => {
    const s = initialMission();
    const before = JSON.stringify(s);
    const v = previewTurn(s, defaultPlan());
    expect(JSON.stringify(s)).toBe(before);
    expect(commitTurn(s, defaultPlan(), 1)).toMatchObject(v.after);
  });
  it("caps batteries and oxygen before consumption", () => {
    const s = { ...initialMission(), energy: 20, oxygen: 60 };
    const v = previewTurn(s, defaultPlan());
    expect(v.available).toBe(20);
    expect(v.spilledEnergy).toBe(10);
    expect(v.oxygenOverflow).toBe(12);
    expect(v.after.oxygen).toBe(48);
  });
  it("rejects an unaffordable plan and stale commits", () => {
    const s = { ...initialMission(), energy: 0, turn: 3 };
    expect(
      previewTurn(s, { ...defaultPlan(), task: "fieldSample" }).errors.length,
    ).toBeGreaterThan(0);
    expect(commitTurn(s, defaultPlan(), 2)).toBe(s);
    expect(commitTurn(s, defaultPlan(), 3)).toBe(s);
  });
  it("rejects locked sampling, final-turn advice, and excess shielding", () => {
    expect(
      previewTurn(initialMission(), { ...defaultPlan(), task: "fieldSample" })
        .errors,
    ).toHaveLength(1);
    expect(
      previewTurn(
        { ...initialMission(), turn: 6 },
        { ...defaultPlan(), task: "askEarth" },
      ).errors,
    ).toHaveLength(1);
    expect(
      previewTurn(
        { ...initialMission(), shieldLevel: 2 },
        { ...defaultPlan(), task: "upgradeShield" },
      ).errors,
    ).toHaveLength(1);
  });
  it("resets interrupted crop growth and harvests before food consumption", () => {
    const s = { ...initialMission(), food: 1, growthProgress: 1 };
    expect(previewTurn(s, defaultPlan())).toMatchObject({
      harvest: 2,
      after: { food: 2 },
      growthProgress: 0,
    });
    expect(
      previewTurn(s, { ...defaultPlan(), greenhouseOn: false }).growthProgress,
    ).toBe(0);
  });
  it("applies upgraded protection immediately and compounds shelter protection", () => {
    const s = { ...initialMission(), turn: 2 };
    expect(
      previewTurn(s, {
        oxygenOn: false,
        greenhouseOn: false,
        task: "upgradeShield",
      }).exposureAdded,
    ).toBe(6);
    expect(
      previewTurn(
        { ...s, shieldLevel: 1 },
        { oxygenOn: false, greenhouseOn: false, task: "shelter" },
      ).exposureAdded,
    ).toBe(1.5);
  });
  it.each(["oxygen", "water", "food"] as const)(
    "stops when %s runs out",
    (resource) => {
      const s = {
        ...initialMission(),
        [resource]: resource === "oxygen" ? 12 : 1,
      };
      expect(
        commitTurn(s, { oxygenOn: false, greenhouseOn: false, task: "rest" }, 1)
          .status,
      ).toBe("rescue");
    },
  );
  it("uses rescue precedence on final turn and forbids further actions", () => {
    const s = {
      ...initialMission(),
      turn: 6,
      food: 1,
      research: 3,
      samples: 1,
    };
    const result = commitTurn(
      s,
      { oxygenOn: false, greenhouseOn: false, task: "rest" },
      6,
    );
    expect(result.status).toBe("rescue");
    expect(commitTurn(result, defaultPlan(), 7)).toBe(result);
  });
  it("supports safe return without all objectives", () => {
    const s = { ...initialMission(), turn: 6 };
    expect(
      commitTurn(s, { oxygenOn: false, greenhouseOn: false, task: "rest" }, 6)
        .status,
    ).toBe("safeReturn");
  });
  it("reconstructs validated history and ignores tampered resource totals", () => {
    const s = run(base.slice(0, 3));
    expect(decodeSave(JSON.stringify({ ...s, energy: 999 }))).toEqual(s);
    expect(run(base)).toEqual(run(base));
  });
  it("rejects corrupt, incompatible and impossible histories", () => {
    expect(() => decodeSave("{")).toThrow();
    expect(() =>
      decodeSave(
        JSON.stringify({ ...initialMission(), rulesVersion: "other" }),
      ),
    ).toThrow();
    expect(() =>
      decodeSave(
        JSON.stringify({
          ...initialMission(),
          history: [
            { turn: 1, plan: { ...defaultPlan(), task: "fieldSample" } },
          ],
        }),
      ),
    ).toThrow();
  });
});
