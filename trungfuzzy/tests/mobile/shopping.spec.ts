import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/shop");
  await page.evaluate(() => {
    localStorage.removeItem("fuzzy-cart");
    localStorage.removeItem("fuzzy-wishlist");
  });
  await page.reload();
});

test("product can be added, increased, decreased and removed from cart", async ({ page }) => {
  const firstProduct = page.locator(".dynamic-product-card").first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart");
  const row = page.locator(".swipe-cart-row").first();
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Increase quantity" }).click();
  await expect(row.locator(".cart-quantity b")).toHaveText("2");
  await row.getByRole("button", { name: "Decrease quantity" }).click();
  await expect(row.locator(".cart-quantity b")).toHaveText("1");
  await row.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
});

test("wishlist supports favorite, add to cart and remove", async ({ page }) => {
  const firstProduct = page.locator(".dynamic-product-card").first();
  await firstProduct.locator(".product-favorite-button").click();
  await page.goto("/wishlist");
  const item = page.locator(".wishlist-page article").first();
  await expect(item).toBeVisible();
  await item.getByRole("button", { name: "Add to cart" }).click();
  await item.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Your wishlist is empty.")).toBeVisible();
});

test("bottom navigation marks the current route", async ({ page }) => {
  await page.goto("/landing");
  await expect(page.locator('.app-bottom-nav a[href="/landing"]')).toHaveClass(/active/);
  await page.locator('.app-bottom-nav a[href="/categories"]').click();
  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.locator('.app-bottom-nav a[href="/categories"]')).toHaveClass(/active/);
});

test("admin dashboards fit the mobile viewport", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: "Product Management" })).toBeVisible();
  await expect(page.locator(".admin-product-table article").first()).toBeVisible();
  await page.getByRole("link", { name: "Users" }).click();
  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await page.getByRole("link", { name: "Products" }).click();
  await page.getByRole("link", { name: "Orders" }).click();
  await expect(page.getByRole("heading", { name: "Order Management" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
