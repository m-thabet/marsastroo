import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("plays a complete mission, resumes, and opens original science", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your outpost. Your decisions." }),
  ).toBeVisible();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const toggle = async (name: string, on: boolean) => {
    await page.getByRole("checkbox", { name }).setChecked(on);
  };
  const turn = async (
    n: number,
    oxygen: boolean,
    green: boolean,
    task: string,
  ) => {
    await toggle("Oxygen production", oxygen);
    await toggle("Greenhouse lights", green);
    await page.getByRole("radio", { name: task, exact: false }).check();
    await page.getByRole("button", { name: `End turn ${n}` }).click();
  };
  await turn(1, true, true, "Lab research");
  await page.reload();
  await expect(page.getByRole("button", { name: "End turn 2" })).toBeVisible();
  await turn(2, true, true, "Take shelter");
  await turn(3, false, false, "Rover expedition");
  await turn(4, true, false, "Ask Earth");
  await expect(
    page.getByText("Earth reply: a solar warning", { exact: false }),
  ).toBeVisible();
  await turn(5, false, false, "Take shelter");
  await turn(6, false, false, "Lab research");
  await expect(
    page.getByRole("heading", { name: "Mission accomplished, Commander." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sources & credits" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("2024-05-10T06:27:00-FLR-001")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(errors).toEqual([]);
});
test("responsive controls, lightweight map, and accessibility", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Lightweight view", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Greenhouse", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Greenhouse", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    scan.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.screenshot({
    path: `test-results/mission-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("recovers from corrupt saves and unavailable browser storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("marsastro.save.v1", "{broken");
  });
  await page.goto("/");
  await expect(
    page.getByText("Your previous save could not be loaded.", { exact: false }),
  ).toBeVisible();
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("denied");
    };
  });
  await page.reload();
  await expect(
    page.getByText("Saving is unavailable.", { exact: false }),
  ).toBeVisible();
});
test("keeps the mission playable after a WebGL context loss", async ({
  page,
}) => {
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await page.screenshot({
    path: `test-results/3d-${test.info().project.name}.png`,
    fullPage: true,
  });
  await canvas.evaluate((element: HTMLCanvasElement) => {
    element
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
  });
  await expect(page.getByLabel("Lightweight outpost map")).toBeVisible();
  await expect(page.getByRole("button", { name: "End turn 1" })).toBeEnabled();
});
