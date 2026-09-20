import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import assert from "node:assert/strict";

// npm supplies its CLI path when run as a package script, avoiding Windows shell quoting.
const npmCli = process.env.npm_execpath;
assert(npmCli, "Run with npm run verify:release");
const output = execFileSync(
  process.execPath,
  [npmCli, "pack", "--dry-run", "--json", "--ignore-scripts"],
  { encoding: "utf8" },
);
const [pack] = JSON.parse(output);
const allowed =
  /^(dist\/|studio\/|examples\/|README(?:\.zh-CN)?\.md$|LICENSE$|REPOSITORY-SCOPE\.md$|THIRD_PARTY_NOTICES\.md$|package\.json$)/;
for (const file of pack.files) {
  assert(allowed.test(file.path), `Unexpected package file: ${file.path}`);
  assert(
    !/\.(?:db|pem|log)$|(?:^|\/)\.env|\.patch\.yml/.test(file.path),
    `Private file in archive: ${file.path}`,
  );
}
for (const required of [
  "dist/index.js",
  "dist/cli.js",
  "dist/core.js",
  "studio/index.html",
  "examples/skill.json",
  "README.zh-CN.md",
  "REPOSITORY-SCOPE.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
])
  assert(
    pack.files.some((f) => f.path === required),
    `Missing ${required}`,
  );
const scan = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? scan(join(dir, entry.name)) : [join(dir, entry.name)],
  );
const docs = [
  "README.md",
  "README.zh-CN.md",
  "REPOSITORY-SCOPE.md",
  ...scan("docs").filter((p) => p.endsWith(".md")),
];
for (const file of docs) {
  const source = readFileSync(file, "utf8");
  assert(
    !/[A-Z]:[\\/](?:Users|工作)[\\/]/.test(source),
    `Local path in ${file}`,
  );
  const targets = [
    ...Array.from(source.matchAll(/\]\(([^)]+)\)/g), (match) => match[1]),
    ...Array.from(
      source.matchAll(/(?:href|src)="([^"]+)"/g),
      (match) => match[1],
    ),
  ];
  for (const target of targets) {
    if (/^(https?:|#)/.test(target)) continue;
    const path = resolve(file, "..", decodeURIComponent(target.split("#")[0]));
    readFileSync(path);
  }
}
console.log(
  `Release file allowlist and local documentation links verified (${pack.files.length} archive entries).`,
);
