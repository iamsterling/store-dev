import { expect, test } from "@playwright/test";

test("edit previews preserve history, clear on navigation, and refresh to canonical pages", async ({
  page,
}, testInfo) => {
  await page.goto("/edits/slow-mornings");
  const productLink = page.getByRole("link", {
    name: "View The Coast Dinnerware Set",
  });
  await productLink.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  await productLink.click();
  const preview = page.getByRole("dialog", {
    name: "The Coast Dinnerware Set",
    exact: true,
  });
  await expect(preview).toBeVisible();
  await expect(page).toHaveURL(/\/products\/coast-dinnerware$/);
  if (testInfo.project.name === "mobile") {
    await expect
      .poll(async () => (await preview.boundingBox())?.y ?? Infinity)
      .toBeLessThan(page.viewportSize()!.height * 0.07);
  } else {
    await expect
      .poll(async () => (await preview.boundingBox())?.x ?? Infinity)
      .toBeLessThan(page.viewportSize()!.width * 0.55);
  }
  await page.screenshot({ path: testInfo.outputPath("product-preview.png") });
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(productLink).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.goForward();
  await expect(preview).toBeVisible();
  await preview.getByRole("button", { name: "Delivery & returns" }).click();
  await preview.getByRole("link", { name: "Good to know" }).click();
  await expect(page).toHaveURL(/\/help$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/products/coast-dinnerware");
  await expect(page.getByTestId("full-product-page")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("full-product-page")).toBeVisible();
});

test("home renders product photography and fits the viewport", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Good things.Every day.",
  );
  await expect(
    page.getByRole("link", { name: "View The Coast Dinnerware Set" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Sunlit living room with natural textures, a cream sofa, and a round wooden table",
    }),
  ).toBeVisible();
  for (const image of await page.getByRole("img").all()) {
    await image.scrollIntoViewIfNeeded();
  }
  await expect
    .poll(() =>
      page
        .getByRole("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("storefront-home.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("customers can search, filter, sort, and recover from no results", async ({
  page,
}) => {
  await page.goto("/shop");
  await page.getByLabel("Find something good").fill("pendant");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(
    page.getByRole("link", { name: "View The Arc Pendant" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View The Coast Dinnerware Set" }),
  ).toHaveCount(0);
  await page.getByLabel("Find something good").fill("spaceship");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(
    page.getByRole("heading", { name: "No good things found. Yet." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Clear filters" }).click();
  await page
    .getByRole("navigation", { name: "Product categories" })
    .getByRole("link", { name: "Living", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The living edit.",
  );
  await page.getByLabel("Sort by").selectOption("price-asc");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("article").first()).toContainText(
    "The Slow Evening Candle",
  );
  await expect(page.getByRole("article")).toHaveCount(2);
});

test("product details and bag support add, update, reload, remove, and keyboard close", async ({
  page,
}) => {
  await page.goto("/shop");
  await page
    .getByRole("link", { name: "View The Coast Dinnerware Set" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The Coast Dinnerware Set",
  );
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  const bag = page.getByRole("dialog", { name: /Your bag/ });
  await expect(bag).toBeVisible();
  await expect(bag.getByTestId("bag-subtotal")).toHaveText("$48.00");
  await bag
    .getByRole("button", {
      name: "Increase quantity of The Coast Dinnerware Set",
    })
    .click();
  await expect(bag.getByTestId("bag-subtotal")).toHaveText("$96.00");
  await expect(
    bag.getByRole("button", { name: "Checkout coming soon" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/shop$/);
  await expect(
    page.getByRole("link", { name: "View The Coast Dinnerware Set" }),
  ).toBeFocused();
  await page.getByRole("link", { name: "Open shopping bag (2 items)" }).click();
  await expect(page).toHaveURL(/\/bag$/);
  await expect(bag).toBeVisible();
  await page.reload();
  const fullBag = page.getByTestId("full-bag-page");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    fullBag.getByRole("status", {
      name: "Quantity of The Coast Dinnerware Set",
      exact: true,
    }),
  ).toHaveText("2");
  await fullBag
    .getByRole("button", { name: "Remove The Coast Dinnerware Set" })
    .click();
  await expect(
    fullBag.getByRole("heading", { name: "Room for something lovely." }),
  ).toBeVisible();
});

test("corrupt local bag data is ignored and quick-add still works", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("daymark:bag:v1", "{invalid-json"),
  );
  await page.goto("/shop");
  await page
    .getByRole("button", { name: "Add The Slow Evening Candle to bag" })
    .click();
  await expect(page.getByRole("dialog").getByTestId("bag-subtotal")).toHaveText(
    "$24.00",
  );
});

test("unrecognized products get a useful 404", async ({ page }) => {
  const response = await page.goto("/products/not-a-real-product");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This one got away." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to the collection" }).click();
  await expect(
    page.getByRole("heading", { name: "Good things, all together." }),
  ).toBeVisible();
});

test("collection navigation works and closes the mobile menu", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Kitchen", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  } else {
    await page.goto("/shop?category=Kitchen");
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The kitchen edit.",
  );
  await expect(page.getByRole("article")).toHaveCount(1);
});

test("the bag works in memory when browser storage writes are blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage is unavailable", "QuotaExceededError");
    };
  });
  await page.goto("/shop");
  await page
    .getByRole("button", { name: "Add The Slow Evening Candle to bag" })
    .click();
  const bag = page.getByRole("dialog", { name: /Your bag/ });
  await expect(bag.getByTestId("bag-subtotal")).toHaveText("$24.00");
  await bag
    .getByRole("button", {
      name: "Increase quantity of The Slow Evening Candle",
    })
    .click();
  await expect(bag.getByTestId("bag-subtotal")).toHaveText("$48.00");
});
