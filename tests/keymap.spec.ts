import { test } from "@playwright/test";

test.describe("Keymap", () => {
  test("can move down a line using the down arrow", async ({ page }) => {
    test.fixme();
  });
  test("can move up a line using the up arrow", ({ page }) => {
    test.fixme();
  });
  test("can move to the left of a character by using the left arrow", async ({
    page,
  }) => {
    test.fixme();
  });
  test("can move to the right of a character by using the right arrow", async ({
    page,
  }) => {
    test.fixme();
  });
  test("cannot move around when the editor is readonly", async ({ page }) => {
    test.fixme();
  });

  test("grey bar lights up green when you enter a standalone prisma query block that spans a single line", async ({
    page,
  }) => {
    test.fixme();
  });
  test("grey run button lights up green when you enter a standalone prisma query block that spans a single line", async ({
    page,
  }) => {
    test.fixme();
  });

  test("grey bar lights up green when you enter a standalone prisma query block that spans multiple lines", async ({
    page,
  }) => {
    test.fixme();
  });
  test("grey run button lights up green when you enter a standalone prisma query block that spans multiple lines", async ({
    page,
  }) => {
    test.fixme();
  });

  test("grey bar lights up green when you enter a prisma query block with a variable assignment", async ({
    page,
  }) => {
    test.fixme();
  });
  test("grey run button lights up green when you enter a prisma query block with a variable assignment", async ({
    page,
  }) => {
    test.fixme();
  });

  test("noop when Cmd+Enter is pressed when the cursor is not under a query", async ({
    page,
  }) => {
    test.fixme();
  });
  test("calls callback when Cmd+Enter is pressed when the cursor is under a query", async ({
    page,
  }) => {
    test.fixme();
  });
});
