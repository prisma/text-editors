import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { expect, test } from "@playwright/test";
import { findQueries } from "../src/extensions/prisma-query/find-queries";

const prismaClientImport = `import { PrismaClient } from '@prisma/client'\nconst prisma = new PrismaClient()\n`;
const modelQuery = `prisma.user.findUnique({ where: { id: 1 } })`;
const genericQuery = `prisma.$executeRaw(\`SELECT * FROM "Album"\`)`;

test.describe("findQueries", () => {
  test("does not include the `await` keyword in model query ranges", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${modelQuery}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + modelQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", modelQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });
  test("does not include the `await` keyword in generic query ranges", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${genericQuery}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + genericQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", genericQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find top-level, model queries", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${modelQuery}\n\nawait ${modelQuery}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + modelQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", modelQuery);

    queries.next();
    expect(queries).toHaveProperty("from", 139);
    expect(queries).toHaveProperty("to", 139 + modelQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", modelQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });
  test("can find top-level, generic queries", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${genericQuery}\n\nawait ${genericQuery}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + genericQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", genericQuery);

    queries.next();
    expect(queries).toHaveProperty("from", 138);
    expect(queries).toHaveProperty("to", 138 + genericQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", genericQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find model queries inside regular functions", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nasync function fn(value: string) {\n\tconst x = 1\n\tawait ${modelQuery}\n\tawait ${modelQuery}}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 136);
    expect(queries).toHaveProperty("to", 136 + modelQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", modelQuery);

    queries.next();
    expect(queries).toHaveProperty("from", 188);
    expect(queries).toHaveProperty("to", 188 + modelQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", modelQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });
  test("can find generic queries inside regular functions", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nasync function fn(value: string) {\n\tconst x = 1\n\tawait ${genericQuery}\n\tawait ${genericQuery}}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 136);
    expect(queries).toHaveProperty("to", 136 + genericQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", genericQuery);

    queries.next();
    expect(queries).toHaveProperty("from", 187);
    expect(queries).toHaveProperty("to", 187 + genericQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", genericQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find model queries inside arrow functions", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nconst fn = async (value: string) => {\n\tconst x = 1\n\tawait ${modelQuery}\n\tawait ${modelQuery}}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 139);
    expect(queries).toHaveProperty("to", 139 + modelQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", modelQuery);

    queries.next();
    expect(queries).toHaveProperty("from", 191);
    expect(queries).toHaveProperty("to", 191 + modelQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", modelQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });
  test("can find generic queries inside arrow functions", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nconst fn = async (value: string) => {\n\tconst x = 1\n\tawait ${genericQuery}\n\tawait ${genericQuery}}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 139);
    expect(queries).toHaveProperty("to", 139 + genericQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", genericQuery);

    queries.next();
    expect(queries).toHaveProperty("from", 190);
    expect(queries).toHaveProperty("to", 190 + genericQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", genericQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can mark correct ranges when model queries span multiple lines", () => {
    const query = `prisma.user.findMany({\n\twhere: {\n\t\tid: 1\n\t}\n})`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries).toHaveProperty("from", 140);
    expect(queries).toHaveProperty("to", 140 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });
  test("can mark correct ranges when generic queries span multiple lines", () => {
    const query = `prisma.$queryRaw(\n\t\`SELECT * FROM "User"\`\n)`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries).toHaveProperty("from", 137);
    expect(queries).toHaveProperty("to", 137 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("does not include variable assignments in model query ranges", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nlet result = await ${modelQuery}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 100);
    expect(queries).toHaveProperty("to", 100 + modelQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", modelQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });
  test("does not include variable assignments in generic query ranges", () => {
    const state = EditorState.create({
      doc: `${prismaClientImport}\nlet result = await ${genericQuery}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 100);
    expect(queries).toHaveProperty("to", 100 + genericQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", genericQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("does not find any queries when PrismaClient variable name does not match", () => {
    const query = `prisma2.user.findMany({})`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nlet result = await ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries.value).toBe(null);
  });
  test("does not find any queries when PrismaClient construction does not exist", () => {
    const query = `prisma2.$queryRaw(\`SELECT 1;\`)`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nlet result = await ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries.value).toBe(null);
  });

  test("does not qualify a model query if it does not start with `await`", () => {
    const query = `prisma2.user.findMany({})`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nlet result = ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries.value).toBe(null);
  });
  test("does not qualify a generic query if it does not start with `await`", () => {
    const query = `prisma2.$queryRaw(\`SELECT 1;\`)`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nlet result = ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries.value).toBe(null);
  });
});

test.describe("findQueries", () => {
  test("can find aggregate queries", () => {
    const query = `prisma.user.aggregate({ _count: true })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find count queries", () => {
    const query = `prisma.user.count({ where: { id: 3 } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find create queries", () => {
    const query = `prisma.user.create({ data: { id: 1, name: "test" } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find createMany queries", () => {
    const query = `prisma.user.createMany({ data: [{ id: 1, name: "test1" }, { id: 2, name: "test2" }] })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find delete queries", () => {
    const query = `prisma.user.delete({ where: { id: 2 } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find deleteMany queries", () => {
    const query = `prisma.user.deleteMany({ where: { name: { contains: "S" } } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find findFirst queries", () => {
    const query = `prisma.user.findFirst({ where: { name: { contains: "S" } } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find findMany queries", () => {
    const query = `prisma.user.findMany({ where: { name: { contains: "S" } } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find findUnique queries", () => {
    const query = `prisma.user.findUnique({ where: { name: { contains: "S" } } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find groupBy queries", () => {
    const query = `prisma.user.groupBy({ by: ['id', 'name'] })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find update queries", () => {
    const query = `prisma.user.update({ where: { id: 1 }, data: { name: "updated" } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find updateMany queries", () => {
    const query = `prisma.user.updateMany({ where: { name: { startsWith: "A" } }, data: { name: "updated" } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find upsert queries", () => {
    const query = `prisma.user.upsert({ where: { id: 1 }, data: { name: "test" } })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find $connect queries", () => {
    const query = `prisma.$connect()`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find $disconnect queries", () => {
    const query = `prisma.$disconnect()`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find $executeRaw queries", () => {
    const query = `prisma.$executeRaw(\`SELECT 1;\`)`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find $on statements", () => {
    const internalQuery = `prisma.user.deleteMany()`;
    const query = `prisma.$on('beforeExit', async (e) => { await ${internalQuery} })`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries).toHaveProperty("from", 133);
    expect(queries).toHaveProperty("to", 133 + internalQuery.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", internalQuery);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find $queryRaw queries", () => {
    const query = `prisma.$queryRaw(\`SELECT 1;\`)`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find $transaction queries", () => {
    const query = `prisma.$transaction([\nprisma.user.create({ data: { id: 1 } }),\nprisma.post.create({ data: { title: "test" } })\n])`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });

  test("can find $use statements", () => {
    const query = `prisma.$use((params, next) => {\n\tconsole.log(params)\n\treturn next(params)})`;
    const state = EditorState.create({
      doc: `${prismaClientImport}\nawait ${query}`,
      extensions: [javascript({ typescript: true })],
    });

    const queries = findQueries(state).iter(0);
    expect(queries).toHaveProperty("from", 87);
    expect(queries).toHaveProperty("to", 87 + query.length);
    expect(queries.value).not.toBe(null);
    expect(queries.value).toHaveProperty("text", query);

    queries.next();
    expect(queries.value).toBe(null);
  });
});
