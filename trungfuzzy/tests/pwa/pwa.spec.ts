import { expect, test } from "@playwright/test";

test("manifest and service worker are valid", async ({ page }) => {
  await page.goto("/landing");
  const manifest = await page.request.get("/manifest.json");
  expect(manifest.ok()).toBeTruthy();
  const data = await manifest.json();
  expect(data.name).toBe("Trung Fuzzy Shopping");
  expect(data.icons.length).toBeGreaterThanOrEqual(2);
  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    return { active: Boolean(ready.active), scope: ready.scope };
  });
  expect(registration.active).toBeTruthy();
  expect(registration.scope).toContain("localhost:4173");
});

test("cached app opens and reports offline state", async ({ page, context }) => {
  await page.goto("/landing");
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload({ waitUntil: "networkidle" });
  }
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBeTruthy();
  const cached = await page.evaluate(async () => ({
    landing: Boolean(await caches.match("/landing")),
    root: Boolean(await caches.match("/")),
    offline: Boolean(await caches.match("/offline.html"))
  }));
  expect(cached).toEqual({ landing: true, root: true, offline: true });
  await page.waitForTimeout(1000);
  await context.setOffline(true);
  await expect(page.getByText("Không có kết nối mạng")).toBeVisible();
  await expect(page.locator(".app-bottom-nav")).toBeVisible();
  await context.setOffline(false);
});
