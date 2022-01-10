import { test } from "@playwright/test";

test.describe.parallel("Fold gutter", () => {
  test("shows fold SVGs on lines that can be folded", async ({ page }) => {
    test.fixme();
  });
  test("shows unfold SVGs on lines that are already folded", async ({
    page,
  }) => {
    test.fixme();
  });

  test("can fold even if editor is readonly", async ({ page }) => {
    test.fixme();
  });
  test("can unfold even if editor is readonly", async ({ page }) => {
    test.fixme();
  });
});
