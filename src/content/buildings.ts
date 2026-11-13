export const BUILDINGS = [
  {
    name: "Living habitat",
    x: 0,
    z: 0,
    color: "#e7e1ce",
    description:
      "Your crew's home. Essential support always uses 4 energy each turn.",
  },
  {
    name: "Life support",
    x: -2.8,
    z: 0,
    color: "#f2e4ce",
    description:
      "Atmosphere processing produces oxygen using electricity. Your crew also needs stored water.",
  },
  {
    name: "Greenhouse",
    x: 0,
    z: -2.8,
    color: "#91a67b",
    description:
      "Power crops for two consecutive turns to harvest 2 meal packs. Each powered turn uses 3 energy and 1 water.",
  },
  {
    name: "Science lab",
    x: 2.8,
    z: 0,
    color: "#f0dfc1",
    description:
      "Lab research uses 4 energy and completes one research objective.",
  },
  {
    name: "Radiation shelter",
    x: 0,
    z: 2.8,
    color: "#7c8b81",
    description:
      "Shelter uses your crew task and 2 energy for ventilation. Exposure is reduced by 75% this turn.",
  },
  {
    name: "Communication center",
    x: -2.8,
    z: -2.8,
    color: "#e5cda9",
    description:
      "Spend a crew task and 2 energy to ask Earth. A planning hint arrives next turn.",
  },
  {
    name: "Power station",
    x: 3.2,
    z: -3.3,
    color: "#394b5e",
    description:
      "Solar panels generate 10 energy, or 6 during dust. The battery stores up to 20.",
  },
  {
    name: "Storage center",
    x: -2.8,
    z: 2.8,
    color: "#c6ac8c",
    description:
      "Check stored water and food before planning. This prototype has no separate repair inventory.",
  },
] as const;
export type BuildingName = (typeof BUILDINGS)[number]["name"];
