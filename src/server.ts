import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { readFile } from "node:fs/promises";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  SparkError,
  parseSkillJSON,
  skillMarkdown,
  text,
  type Language,
} from "./core.js";
import { previewMarkdown } from "./markdown.js";
import type { SparkStore } from "./store.js";

async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  let size = 0;
  const parts: Buffer[] = [];
  for await (const part of req) {
    const buffer = Buffer.from(part);
    size += buffer.length;
    // JSON may encode a single source byte as six ASCII characters (e.g. \u0001).
    if (size > 6 * 64000 + 4096)
      throw new SparkError(
        "INPUT_TOO_LARGE",
        "Encoded request too large / 编码后请求过大",
      );
    parts.push(buffer);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(parts).toString());
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new SparkError("INVALID_JSON", "Expected a JSON object");
  }
}
function language(value: unknown): Language {
  if (value === "en" || value === "zh") return value;
  throw new SparkError("INVALID_LANGUAGE", "language must be en or zh");
}
export function createStudio(store: SparkStore) {
  const secret = randomBytes(32).toString("hex");
  const assets: Record<string, [string, string]> = {
    "/": ["index.html", "text/html"],
    "/studio.js": ["studio.js", "text/javascript"],
    "/styles.css": ["styles.css", "text/css"],
    "/mark.svg": ["mark.svg", "image/svg+xml"],
  };
  const server = createServer(async (req, res) => {
    const address = server.address();
    const authority =
      address && typeof address === "object" ? `127.0.0.1:${address.port}` : "";
    const reply = (status: number, value: unknown) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(value));
    };
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );
    if (
      req.headers.host !== authority ||
      (req.headers.origin && req.headers.origin !== `http://${authority}`)
    ) {
      reply(403, { error: "ORIGIN_DENIED" });
      return;
    }
    try {
      const path = new URL(req.url ?? "/", `http://${authority}`).pathname;
      if (req.method === "GET" && assets[path]) {
        const [file, mime] = assets[path];
        let content = await readFile(
          fileURLToPath(new URL(`../studio/${file}`, import.meta.url)),
          "utf8",
        );
        if (file === "index.html")
          content = content.replace("{{SPARK_TOKEN}}", secret);
        res.writeHead(200, { "Content-Type": `${mime}; charset=utf-8` });
        res.end(content);
        return;
      }
      if (req.method === "GET" && path === "/api/state") {
        reply(200, { skills: store.skills(), history: store.history() });
        return;
      }
      if (req.method !== "POST" || !path.startsWith("/api/")) {
        reply(404, { error: "NOT_FOUND" });
        return;
      }
      const candidate = req.headers["x-spark-token"];
      if (
        typeof candidate !== "string" ||
        Buffer.byteLength(candidate) !== secret.length ||
        !timingSafeEqual(Buffer.from(candidate), Buffer.from(secret))
      ) {
        reply(403, { error: "TOKEN_REQUIRED" });
        return;
      }
      if (req.headers["content-type"] !== "application/json") {
        reply(415, { error: "JSON_REQUIRED" });
        return;
      }
      const b = await body(req);
      if (path === "/api/collide" || path === "/api/save") {
        const args = [
          text(b.first, "first", 80),
          text(b.second, "second", 80),
          text(b.goal, "goal", 1000),
          language(b.language),
        ] as const;
        reply(
          200,
          path === "/api/save"
            ? store.save(...args)
            : { collision: store.preview(...args) },
        );
      } else if (path === "/api/grow") {
        const result = store.grow(
          text(b.id, "id", 80),
          text(b.name, "name", 120),
        );
        reply(200, { ...result, markdown: skillMarkdown(result.skill) });
      } else if (path === "/api/import-preview") {
        reply(
          200,
          previewMarkdown(typeof b.markdown === "string" ? b.markdown : ""),
        );
      } else if (path === "/api/import")
        reply(200, store.put(parseSkillJSON(text(b.json, "json", 64000))));
      else reply(404, { error: "NOT_FOUND" });
    } catch (error) {
      if (error instanceof SparkError)
        reply(400, { error: error.code, message: error.message });
      else
        reply(500, {
          error: "STORAGE_ERROR",
          message:
            "Local operation failed. Your saved data was not replaced. / 本地操作失败。",
        });
    }
  });
  server.requestTimeout = 10000;
  return server;
}
