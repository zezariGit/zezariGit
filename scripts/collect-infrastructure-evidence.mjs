import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

function run(command, args) {
  return execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function stripAnsi(value) {
  return String(value || "").replace(/\u001b\[[0-9;]*m/g, "");
}

function runCombined(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(String(result.stderr || result.stdout || `${command} failed`).trim());
  }
  return `${result.stdout || ""}\n${result.stderr || ""}`.trim();
}

function maskTursoHost(hostname) {
  const match = hostname.match(/^(.+?)\.(aws-[a-z]+-[a-z]+-\d+)\.turso\.io$/i);
  if (!match) return "***.turso.io";
  const databasePart = match[1].split("-").slice(0, 1).join("-");
  return `${databasePart}-***.${match[2]}.turso.io`;
}

const project = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
const packageLock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const inspectOutput = stripAnsi(runCombined("cmd.exe", ["/d", "/s", "/c", "npx vercel inspect https://zezari.family"]));
const deploymentId = inspectOutput.match(/\bid\s+(dpl_[A-Za-z0-9]+)/)?.[1] || "확인 필요";
const deploymentStatus = inspectOutput.match(/\bstatus\s+[^A-Za-z]*(Ready|Building|Error)/i)?.[1] || "확인 필요";
const functionRegion = inspectOutput.match(/\u03bb index[^\r\n]*\[([a-z0-9]+)\]/i)?.[1] || "확인 필요";

const tursoUrl = new URL(process.env.TURSO_DATABASE_URL || "");
const regionCode = tursoUrl.hostname.match(/\.(aws-[a-z]+-[a-z]+-\d+)\.turso\.io$/i)?.[1] || "확인 필요";
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const firstRow = async (sql) => (await db.execute(sql)).rows[0] || {};
const sqlite = await firstRow("SELECT sqlite_version() AS version");
const schema = await firstRow("SELECT version, updated_at FROM schema_meta WHERE id = 'app'");
const tableCount = await firstRow("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
const pageCount = await firstRow("PRAGMA page_count");
const pageSize = await firstRow("PRAGMA page_size");

const commit = run("git.exe", ["rev-parse", "HEAD"]);
const commitCount = Number(run("git.exe", ["rev-list", "--count", "HEAD"]));
const branch = run("git.exe", ["branch", "--show-current"]);
const lastCommit = run("git.exe", ["log", "-1", "--format=%cI"]);
const remote = run("git.exe", ["remote", "get-url", "origin"]);
const envIgnored = run("git.exe", ["check-ignore", ".env.local"]) === ".env.local";

const evidence = {
  generatedAt: new Date().toISOString(),
  vercel: {
    provider: "Vercel managed cloud",
    projectName: project.projectName,
    projectId: project.projectId,
    framework: `Next.js ${packageLock.packages?.["node_modules/next"]?.version || "확인 필요"}`,
    runtime: `Node.js ${project.settings?.nodeVersion || "확인 필요"}`,
    deploymentId,
    deploymentStatus,
    functionRegion,
    domains: "zezari.family / zezari.vercel.app",
  },
  turso: {
    provider: "Turso Cloud / libSQL",
    host: maskTursoHost(tursoUrl.hostname),
    regionCode,
    sqliteVersion: sqlite.version,
    schemaVersion: Number(schema.version || 0),
    schemaUpdatedAt: String(schema.updated_at || ""),
    tableCount: Number(tableCount.count || 0),
    pageCount: Number(pageCount.page_count || 0),
    pageSize: Number(pageSize.page_size || 0),
    logicalBytes: Number(pageCount.page_count || 0) * Number(pageSize.page_size || 0),
  },
  github: {
    provider: "GitHub Cloud",
    repository: remote.replace(/\.git$/, ""),
    branch,
    commit: commit.slice(0, 12),
    commitCount,
    lastCommit,
    envIgnored,
    deploymentIntegration: "GitHub main push -> Vercel production deployment",
  },
};

process.stdout.write(JSON.stringify(evidence, null, 2));
