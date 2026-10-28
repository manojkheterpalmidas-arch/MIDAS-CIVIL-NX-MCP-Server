#!/usr/bin/env node
// MIDAS CIVIL NX tools for Claude Desktop: a stdio bridge to the hosted MCP server.
//
// Claude Desktop starts this program and talks MCP to it over stdin/stdout, one JSON-RPC
// message per line. Every message is forwarded unchanged to https://midasiteurope.com/mcp
// (streamable HTTP) with the user's personal token, and every reply is written back. The
// tools themselves run on midasiteurope.com; nothing about them is in this file.
// No dependencies: Node 18+ (fetch).
"use strict";

const URL_ = (process.env.MIDAS_MCP_URL || "https://midasiteurope.com/mcp").trim();
const TOKEN = (process.env.MIDAS_CNX_TOKEN || "").trim();
const VERSION = "1.0.0";

let sessionId = null;
let protocolVersion = null;

const write = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");
const log = (...a) => process.stderr.write(`[midas-civil-nx] ${a.join(" ")}\n`);

function errorFor(msg, text) {
  // a notification (no id) gets no answer; a request gets a JSON-RPC error it can show
  const out = [];
  for (const m of Array.isArray(msg) ? msg : [msg]) {
    if (m && m.id !== undefined && m.method) out.push({ jsonrpc: "2.0", id: m.id, error: { code: -32000, message: text } });
  }
  return out;
}

/** Parse a text/event-stream body into the JSON messages its data lines carry. */
function sseMessages(text) {
  const out = [];
  for (const block of text.split(/\r?\n\r?\n/)) {
    const data = block.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trimStart()).join("\n");
    if (!data) continue;
    try {
      out.push(JSON.parse(data));
    } catch {
      /* a keep-alive or comment */
    }
  }
  return out;
}

async function forward(msg) {
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream", "user-agent": `midas-civil-nx-desktop/${VERSION}` };
  if (TOKEN) headers.authorization = `Bearer ${TOKEN}`;
  if (sessionId) headers["mcp-session-id"] = sessionId;
  if (protocolVersion) headers["mcp-protocol-version"] = protocolVersion;
  let r;
  try {
    r = await fetch(URL_, { method: "POST", headers, body: JSON.stringify(msg), signal: AbortSignal.timeout(15 * 60 * 1000) });
  } catch (e) {
    return errorFor(msg, `midasiteurope.com could not be reached (${e.name === "TimeoutError" ? "timed out" : e.message}). Check the internet connection and try again.`).forEach(write);
  }
  const sid = r.headers.get("mcp-session-id");
  if (sid) sessionId = sid;
  if (r.status === 202 || r.status === 204) return;
  const text = await r.text();
  if (r.status === 401 || r.status === 403) {
    return errorFor(msg, "midasiteurope.com did not accept the personal token. Make one at midasiteurope.com/llm (free account) and paste it in Claude Desktop: Settings > Extensions > MIDAS CIVIL NX tools.").forEach(write);
  }
  const type = r.headers.get("content-type") || "";
  let replies = [];
  if (type.includes("text/event-stream")) replies = sseMessages(text);
  else {
    try {
      const j = JSON.parse(text);
      replies = Array.isArray(j) ? j : [j];
    } catch {
      return errorFor(msg, `midasiteurope.com answered HTTP ${r.status} with something that is not MCP. Try again shortly.`).forEach(write);
    }
  }
  for (const reply of replies) {
    if (reply?.result?.protocolVersion && !protocolVersion) protocolVersion = reply.result.protocolVersion;
    write(reply);
  }
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      write({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      continue;
    }
    // independent: a long tool call does not hold up the next message
    forward(msg).catch((e) => {
      log("forward failed:", e.message);
      errorFor(msg, `The bridge failed: ${e.message}`).forEach(write);
    });
  }
});
process.stdin.on("end", () => process.exit(0));
if (!TOKEN) log("no personal token set: only the tools that need no model (calculations, MIDAS manuals) will work.");
