#!/usr/bin/env node
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SparkStore } from "./store.js";
import { examples } from "./examples.js";
import { createStudio } from "./server.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    port: { type: "string", default: "4317" },
    "data-dir": { type: "string", default: ".spark" },
    output: { type: "string", default: "spark.patch.yml" },
  },
});
const command = positionals[0];
if (command === "patch") {
  const plugin = fileURLToPath(
    new URL("./index.js", import.meta.url),
  ).replaceAll("\\", "/");
  const dataDir = resolve(values["data-dir"]).replaceAll("\\", "/");
  writeFileSync(
    values.output,
    `- insert:\n    - id: spark\n      name: ${JSON.stringify(plugin)}\n      config:\n        dataDir: ${JSON.stringify(dataDir)}\n        seedExamples: true\n`,
    { flag: "wx" },
  );
  console.log(
    `Created ${values.output}. Load it with: dsh web --patch ${values.output}`,
  );
} else if (command === "studio") {
  const port = Number(values.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Port must be an integer from 1 to 65535");
  const store = new SparkStore(
    resolve(values["data-dir"], "spark.db"),
    examples,
  );
  const server = createStudio(store);
  server.on("error", (error) => {
    console.error(error.message);
    store.close();
    process.exitCode = 1;
  });
  server.listen(port, "127.0.0.1", () =>
    console.log(
      `Spark Studio · http://127.0.0.1:${port}\nLocal rule engine. No model or cloud connection required.`,
    ),
  );
  const close = () =>
    server.close(() => {
      store.close();
      process.exit(0);
    });
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
} else {
  console.log(
    "Spark / 闪光点\n\n  spark studio [--port 4317] [--data-dir .spark]\n  spark patch [--output spark.patch.yml] [--data-dir .spark]\n\nLet skills meet, collide, and grow. / 让 Skill 相遇、碰撞、生长。",
  );
  if (command) process.exitCode = 1;
}
