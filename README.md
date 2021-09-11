# @prisma/text-editors

![tests](https://github.com/prisma/text-editors/actions/workflows/tests.yml/badge.svg) ![npm-version](https://badgen.net/npm/v/@prisma/text-editors)

This package exports a bunch of batteries-included code editors for Typescript, JSON, SQL & Prisma Schemas. The goal is to be a zero-configuration component that is quick to load and that you just dump into your codebase so it "just works".

### Installation

```
npm i @prisma/text-editors

yarn add @prisma/text-editors
```

### Usage

The editors are currently only exported as a React component, but support for other frameworks should be trivial to implement, since all of editor functionality is written in vanilla JS.

Usage with React:

```typescript
import React, { useState } from "react";
import { Editor } from "@prisma/text-editors";

// ..snip

const [code, setCode] = useState("");

return <Editor lang="ts" value={code} onChange={setCode} />;
```

This gives you an editor that includes Typescript syntax highlighting, typechecking, auto-complete & quickinfo on token hover.

**Editor props**

- `lang` (required): Controls what language the editor's `value` will be. This enables or disables certain feature, depending on the language. Currently supported languages are: Typescript (`ts`), JSON (`json`), SQL (`sql`) and Prisma Schema Language (`prisma`)

- `value` (required): The text / code that will be shown in the editor. In general, it is recommended to pass in a controlled React prop here and update its value whenever the editor calls `onChange`. Changing this value directly will cause the editor to recreate its own internal state from scratch, which can be expensive.

- `readonly`: Controls if the editor will allow changes to the `value`

- `theme`: Controls the editor theme, Currently supported themes are `light` & `dark`

- `style`: Any CSS properties passed here will be spread on to the editor container

- `classNames`: Any class names pass here will be applied to the editor container

- `types` (only valid when `lang=ts`): Key value pairs of additional Typescript types that will be injected into the editor lazily. The key must be the "location" of this types (common values are `/node_modules/your-package/index.d.ts`), and the value must be the actual types (such as `export type MyType = string`). These can be useful to fake custom imports in the editor, and affect auto-complete (among other things custom types let you do in VSCode, for example)

---

### Contributing

Please read through the [Wiki](https://github.com/prisma/text-editors/wiki) to learn more about how this package works, and how to contribute.
