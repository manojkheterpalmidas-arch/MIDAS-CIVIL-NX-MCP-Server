// Writes TOOLS.md from the site's tool catalogue (src/data/llm-tools.json in the website repo,
// generated from the same registry the /mcp endpoint serves).
// Usage: node scripts/make-tools-md.mjs <path to llm-tools.json>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/make-tools-md.mjs <llm-tools.json>");
  process.exit(1);
}
const { tools } = JSON.parse(fs.readFileSync(src, "utf8").replace(/^﻿/, ""));

// Same wording as the badges on midasiteurope.com/llm.
function effect(t) {
  if (t.effect === "write") return "Changes model";
  if (t.effect === "read") return t.needsModel ? "Read-only" : "No model";
  return "Calculation";
}
const RUNS = { inline: "", background: "Background", "background-on-apply": "Background when applied" };
const cell = (s) => String(s || "").replace(/\|/g, "\\|").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\s+/g, " ").trim();
// The first sentence, cut to a table-sized length; the full text is on /llm and in tools/list.
// A sentence ends at ". " before a capital, so "e.g. GET" and "(1.0.6)" do not end it.
const MAX = 200;
const firstSentence = (s) => {
  const text = cell(s);
  // a lead-in as short as "Concurrent forces, step 1." says nothing: take the next sentence too
  const ends = [...text.matchAll(/(?<!\be\.g|\bi\.e|\betc)[.!?](?=\s+[A-Z])/g)].map((m) => m.index + 1);
  const end = ends.find((i) => i >= 60);
  const first = end ? text.slice(0, end) : text;
  if (first.length <= MAX) return first;
  const cut = first.slice(0, MAX);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:(\s]+$/, "") + "…";
};

const groups = new Map([["Model and connection", []]]);
for (const t of tools) {
  const k = t.plugin || "Model and connection";
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(t);
}
const plugins = [...groups.keys()].filter((k) => k !== "Model and connection" && groups.get(k).length);

const out = [
  "# Tools",
  "",
  `${tools.length} tools from ${plugins.length} MIDAS IT Europe plugins. Generated from the live catalogue; the full descriptions and every input are on [midasiteurope.com/llm](https://midasiteurope.com/llm#tools), and your assistant reads them from the server itself.`,
  "",
  "- **Calculation**: needs no model and no account.",
  "- **Read-only**: reads the open model, never changes it.",
  "- **Changes model**: previews first, applies only after you agree, and has a matching undo.",
  "- **Background**: on the website the call returns a job at once and the assistant follows it with `job_status`. *When applied* means only the apply runs that way.",
  "",
];
for (const [plugin, list] of groups) {
  if (!list.length) continue;
  out.push(`## ${plugin}`, "", "| Tool | What it does | Effect | Runs |", "|---|---|---|---|");
  for (const t of list) out.push(`| \`${t.name}\` | ${firstSentence(t.description)} | ${effect(t)} | ${RUNS[t.runs] || ""} |`);
  out.push("");
}
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "TOOLS.md");
fs.writeFileSync(dest, out.join("\n"));
console.log(`${tools.length} tools, ${plugins.length} plugins -> ${dest}`);
