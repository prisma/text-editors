# @prisma/text-editors

![tests](https://github.com/prisma/text-editors/actions/workflows/tests.yml/badge.svg) ![npm-version](https://badgen.net/npm/v/@prisma/text-editors)

This package exports a bunch of batteries-included code editors for Typescript, JSON, SQL & Prisma Schemas. The goal is to be a zero configuration component that is quick to load and that you just dump into your codebase so it "just works"

### Installation

```
npm i @prisma/text-editors

yarn add @prisma/text-editors
```

### Usage

The editors are currently only exported as a React component, but support for other frameworks should be trivial to implement.

```typescript
import React, { useState } from "react";
import { Editor } from "@prisma/text-editors";

// ..snip

const [code, setCode] = useState("");

return <Editor value={code} onChange={setCode} />;
```

⚠️ This section is currently incomplete. Please look at the usage of this package on https://github.com/prisma/cloud to learn more.

---

### Contributing

Please read through the [Wiki](https://github.com/prisma/text-editors/wiki) to learn more about how this package works, and how to contribute.
