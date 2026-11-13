export const RULES_VERSION = "1.0.0";
export const CONTENT_VERSION = "1.0.0";
export const EVENTS = [
  "ordinary",
  "storm",
  "dust",
  "ordinary",
  "storm",
  "ordinary",
] as const;
export type Task =
  | "research"
  | "fieldSample"
  | "shelter"
  | "upgradeShield"
  | "askEarth"
  | "rest";
export type Plan = { oxygenOn: boolean; greenhouseOn: boolean; task: Task };
export type Resources = {
  energy: number;
  oxygen: number;
  water: number;
  food: number;
  exposure: number;
};
export type TurnRecord = {
  turn: number;
  event: string;
  plan: Plan;
  before: Resources;
  after: Resources;
  explanation: string;
  sourceIds: string[];
};
export type Mission = Resources & {
  schemaVersion: 1;
  rulesVersion: string;
  contentVersion: string;
  scenarioId: string;
  seed: number;
  turn: number;
  shieldLevel: number;
  growthProgress: number;
  research: number;
  samples: number;
  pendingHint: null | { dueTurn: number; hintId: string };
  revealedHintIds: string[];
  status: "playing" | "success" | "safeReturn" | "rescue";
  history: TurnRecord[];
};
export const TASKS: {
  id: Task;
  title: string;
  cost: number;
  detail: string;
}[] = [
  {
    id: "research",
    title: "Lab research",
    cost: 4,
    detail: "+1 research · stay inside",
  },
  {
    id: "fieldSample",
    title: "Rover expedition",
    cost: 4,
    detail: "+1 research +1 sample · −2 water · extra exposure",
  },
  {
    id: "shelter",
    title: "Take shelter",
    cost: 2,
    detail: "75% less exposure · no research",
  },
  {
    id: "upgradeShield",
    title: "Improve shielding",
    cost: 5,
    detail: "Permanent protection · no research",
  },
  {
    id: "askEarth",
    title: "Ask Earth",
    cost: 2,
    detail: "A planning hint arrives next turn",
  },
  {
    id: "rest",
    title: "Conserve power",
    cost: 0,
    detail: "Save energy · no crew task",
  },
];
export const initialMission = (): Mission => ({
  schemaVersion: 1,
  rulesVersion: RULES_VERSION,
  contentVersion: CONTENT_VERSION,
  scenarioId: "training-01",
  seed: 1,
  turn: 1,
  energy: 12,
  oxygen: 48,
  water: 12,
  food: 5,
  exposure: 0,
  shieldLevel: 0,
  growthProgress: 0,
  research: 0,
  samples: 0,
  pendingHint: null,
  revealedHintIds: [],
  status: "playing",
  history: [],
});
export const defaultPlan = (): Plan => ({
  oxygenOn: true,
  greenhouseOn: true,
  task: "research",
});
const resources = (s: Resources): Resources => ({
  energy: s.energy,
  oxygen: s.oxygen,
  water: s.water,
  food: s.food,
  exposure: s.exposure,
});
export function taskError(s: Mission, task: Task): string | null {
  if (task === "fieldSample" && s.turn < 3)
    return "Rover expeditions unlock on turn 3.";
  if (task === "upgradeShield" && s.shieldLevel >= 2)
    return "Shielding is already fully upgraded.";
  if (task === "askEarth" && s.turn === 6)
    return "There is no next turn for an Earth reply.";
  if (task === "askEarth" && s.pendingHint)
    return "An Earth reply is already on its way.";
  return null;
}
export function previewTurn(s: Mission, p: Plan) {
  const event = EVENTS[s.turn - 1] ?? "ordinary";
  const generation = event === "dust" ? 6 : 10;
  const available = Math.min(20, s.energy + generation);
  const task = TASKS.find((t) => t.id === p.task);
  const cost =
    4 + (p.oxygenOn ? 4 : 0) + (p.greenhouseOn ? 3 : 0) + (task?.cost ?? 0);
  const errors: string[] = [];
  if (s.status !== "playing")
    errors.push("This mission has ended. Start a new mission to play again.");
  if (!task) errors.push("Choose a valid crew task.");
  const unavailable = taskError(s, p.task);
  if (unavailable) errors.push(unavailable);
  if (cost > available)
    errors.push(
      `Your plan needs ${cost - available} more energy. Switch off a system or choose another task.`,
    );
  const shieldLevel = s.shieldLevel + (p.task === "upgradeShield" ? 1 : 0);
  const rawGrowth = p.greenhouseOn ? s.growthProgress + 1 : 0;
  const harvest = rawGrowth === 2 ? 2 : 0;
  const exposureAdded =
    ((event === "storm" ? 8 : 1) + (p.task === "fieldSample" ? 2 : 0)) *
    ([1, 0.75, 0.5][shieldLevel] ?? 0.5) *
    (p.task === "shelter" ? 0.25 : 1);
  const after: Resources = {
    energy: available - cost,
    oxygen: Math.min(60, s.oxygen + (p.oxygenOn ? 12 : 0)) - 12,
    water:
      s.water -
      1 -
      (p.greenhouseOn ? 1 : 0) -
      (p.task === "fieldSample" ? 2 : 0),
    food: s.food + harvest - 1,
    exposure: s.exposure + exposureAdded,
  };
  const warnings: string[] = [];
  if (after.oxygen <= 0)
    warnings.push("Oxygen will run out. The mission will need to stop.");
  if (after.water <= 0)
    warnings.push("Water will run out. The mission will need to stop.");
  if (after.food <= 0)
    warnings.push("Food will run out. The mission will need to stop.");
  if (after.exposure > 12)
    warnings.push("Exposure will exceed the game safety limit.");
  const explanation =
    p.task === "shelter"
      ? `Your crew sheltered instead of doing research. Only ${exposureAdded} exposure points were added.`
      : p.task === "fieldSample"
        ? "Your expedition earned a sample and research, using extra water and accepting more exposure."
        : p.task === "askEarth"
          ? "You used energy and a crew task to ask Earth. Advice arrives next turn, so this decision is still yours."
          : p.task === "upgradeShield"
            ? "You spent energy on permanent protection instead of research. Future exposure will be lower."
            : harvest
              ? "Your powered greenhouse produced two meal packs. Growing food cost energy and water over two turns."
              : p.task === "research"
                ? "Your lab completed research using energy that could have powered life support or growing food."
                : "Your crew conserved energy, giving up a chance to research, improve shielding, or request advice.";
  return {
    after,
    errors,
    warnings,
    cost,
    available,
    generation,
    spilledEnergy: Math.max(0, s.energy + generation - 20),
    oxygenOverflow: Math.max(0, s.oxygen + (p.oxygenOn ? 12 : 0) - 60),
    harvest,
    exposureAdded,
    shieldLevel,
    growthProgress: harvest ? 0 : rawGrowth,
    explanation,
    event,
  };
}
export function commitTurn(s: Mission, p: Plan, expectedTurn: number): Mission {
  if (expectedTurn !== s.turn) return s;
  const v = previewTurn(s, p);
  if (v.errors.length) return s;
  const research =
    s.research + (p.task === "research" || p.task === "fieldSample" ? 1 : 0);
  const samples = s.samples + (p.task === "fieldSample" ? 1 : 0);
  const unsafe =
    v.after.oxygen <= 0 ||
    v.after.water <= 0 ||
    v.after.food <= 0 ||
    v.after.exposure > 12;
  const status = unsafe
    ? "rescue"
    : s.turn === 6
      ? research >= 3 && samples >= 1
        ? "success"
        : "safeReturn"
      : "playing";
  const pending =
    p.task === "askEarth"
      ? { dueTurn: s.turn + 1, hintId: `turn-${s.turn + 1}` }
      : s.pendingHint;
  const hintArrived =
    pending && pending.dueTurn === s.turn + 1 && status === "playing";
  return {
    ...s,
    ...v.after,
    shieldLevel: v.shieldLevel,
    growthProgress: v.growthProgress,
    research,
    samples,
    turn: s.turn + 1,
    status,
    pendingHint: hintArrived ? null : pending,
    revealedHintIds: hintArrived
      ? [...s.revealedHintIds, pending.hintId]
      : s.revealedHintIds,
    history: [
      ...s.history,
      {
        turn: s.turn,
        event: v.event,
        plan: { ...p },
        before: resources(s),
        after: v.after,
        explanation: v.explanation,
        sourceIds:
          v.event === "storm"
            ? ["donki-flare"]
            : p.greenhouseOn
              ? ["csa-food"]
              : p.oxygenOn
                ? ["moxie"]
                : [],
      },
    ],
  };
}
export function earthHint(turn: number) {
  const event = EVENTS[turn - 1];
  return event === "storm"
    ? "Earth reply: a solar warning is active. Shelter lowers exposure, but takes your crew away from research."
    : event === "dust"
      ? "Earth reply: dust reduces this turn’s solar generation. Stored oxygen may let you conserve power."
      : "Earth reply: look ahead at your food and oxygen reserves before spending energy on science.";
}
