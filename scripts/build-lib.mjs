import "zx/globals";

await $`rm -rf dist`;

// Typecheck
await $`yarn tsc`;

// Build
await $`yarn vite build`;

// Build type declarations
await $`yarn tsc --noEmit false --declaration --emitDeclarationOnly --isolatedModules false --outDir dist/types`;
