import { expect, test } from "@playwright/test";
import { TSEditor } from "../src/editor/ts-editor";

test.describe("Typescript extension", () => {
  test("does not crash when content is empty", async ({ page }) => {
    await page.goto("/demo/");
    const editor = await page.$("#ts-editor .cm-content");
    page.on("console", msg => {
      expect(msg.type()).not.toBe("error");
    });
    await editor.selectText();
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(3000); // Wait a few seconds to see if any errors show up in the console
  });

  test.only("can autocomplete empty lines", async () => {
    test.fixme();

    const code = "const x = 1\n\n";
    let editorState = TSEditor.state({
      domElement: null,
      code,
    });
    editorState = editorState.update({
      selection: {
        anchor: 3, //code.length,
      },
    }).state;

    expect(false).toBe(true);
  });

  test("can autocomplete Node built-ins", async ({ page }) => {
    test.fixme();
  });

  test("can autocomplete prisma variable", async ({ page }) => {
    test.fixme();
  });

  test("can autocomplete prisma model property", async ({ page }) => {
    test.fixme();
  });

  test("can autocomplete prisma model operations", async ({ page }) => {
    test.fixme();
  });

  test("can autocomplete prisma generic operations", async ({ page }) => {
    test.fixme();
  });

  test("can autocomplete prisma model operation arguments", async ({
    page,
  }) => {
    test.fixme();
  });

  test("can autocomplete prisma generic operation arguments", async ({
    page,
  }) => {
    test.fixme();
  });
});
