import { z } from "zod";
import {
  initialMission,
  commitTurn,
  RULES_VERSION,
  CONTENT_VERSION,
  type Mission,
} from "../domain/mission";
export const SAVE_KEY = "marsastro.save.v1";
const planSchema = z.object({
  oxygenOn: z.boolean(),
  greenhouseOn: z.boolean(),
  task: z.enum([
    "research",
    "fieldSample",
    "shelter",
    "upgradeShield",
    "askEarth",
    "rest",
  ]),
});
const envelope = z.object({
  schemaVersion: z.literal(1),
  rulesVersion: z.literal(RULES_VERSION),
  contentVersion: z.literal(CONTENT_VERSION),
  scenarioId: z.literal("training-01"),
  seed: z.literal(1),
  history: z
    .array(z.object({ turn: z.number().int().min(1).max(6), plan: planSchema }))
    .max(6),
});
export function decodeSave(raw: string): Mission {
  const data = envelope.parse(JSON.parse(raw));
  let state = initialMission();
  for (const record of data.history) {
    const next = commitTurn(state, record.plan, record.turn);
    if (next === state) throw new Error("Invalid mission history");
    state = next;
  }
  return state;
}
export function loadMission(): { mission: Mission; message: string } {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return { mission: raw ? decodeSave(raw) : initialMission(), message: "" };
  } catch {
    return {
      mission: initialMission(),
      message:
        "Your previous save could not be loaded. A new mission is ready; progress may only last for this visit.",
    };
  }
}
export function saveMission(mission: Mission): string {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(mission));
    return "";
  } catch {
    return "Saving is unavailable. You can keep playing, but progress may not survive a refresh.";
  }
}
