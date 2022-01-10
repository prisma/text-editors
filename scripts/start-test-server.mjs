/**
 * Playwright will only run this script if it finds that there isn't already a web server running on port `PORT`
 * This allows Playwright to reuse the `dev` server if it is already running, or start it if it isn't.
 */

import "zx/globals";

let devProcess;

// Start the dev server
devProcess = $`yarn dev`;

process.on("exit", () => {
  devProcess && devProcess.stop();
});
