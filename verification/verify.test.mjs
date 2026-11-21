// Verification pack: the calculation tools checked against published worked examples and against
// the code's own tables and closed-form equations — numbers worked out here from the clause, not
// taken from the plugins. Each row records source, inputs, expected, the tool's output and the
// difference; VERIFICATION_OUT=<file.json> writes them out for VERIFICATION.md.
//
// Sources (cited by reference, only the numbers are reproduced):
//   JRC  = "Bridge Design to Eurocodes – Worked examples", JRC/EU, EUR 25193 EN (2012), chapter on
//          EN 1991 actions (N. Malakatas), example of application "Wind actions on bridge deck and
//          piers": 3-span 60+80+60 m composite deck, b = 12 m, high piers z = 40 m.
//   EN 1991-1-4:2005, EN 1991-1-5:2003, EN 1991-2:2003, EN 1992-1-1:2004 (recommended values),
//   CS 454 v1.1.0, PD 6694-1:2011+A1:2020.
//
// Rows marked "deviation" are where the tool and the code differ on purpose or by a known engine
// choice; they assert the current value so VERIFICATION.md stays true when the engine changes.
// Where the tools run:
//   CIVIL_MCP_URL=https://midasiteurope.com/mcp   the hosted server, over MCP (calculation tools need no key)
//   CIVIL_TOOLS_BUNDLE=<civil-tools.mjs>          a build in this process (the site bundle)
//   neither                                       ../dist/civil-tools.mjs if it exists, else https://midasiteurope.com/mcp
// The public repository carries a copy of this file (verification/verify.test.mjs); keep the two the same.
// Node 18 or later; nothing to install.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const LOCAL_BUILD = new URL("../dist/civil-tools.mjs", import.meta.url);
const REMOTE = process.env.CIVIL_MCP_URL || (process.env.CIVIL_TOOLS_BUNDLE || existsSync(fileURLToPath(LOCAL_BUILD)) ? "" : "https://midasiteurope.com/mcp");
let rpc;
if (REMOTE) {
  rpc = async (body) => (await fetch(REMOTE, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify(body) })).json();
} else {
  const T = await import(process.env.CIVIL_TOOLS_BUNDLE ? pathToFileURL(path.resolve(process.env.CIVIL_TOOLS_BUNDLE)).href : LOCAL_BUILD.href);
  const host = T.createWebHost({ store: T.memoryStore(), secret: "verification", accounts: { async verify() { return null; } } });
  rpc = async (body) => (await host.handle(new Request("https://site.test/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }), { ip: "203.0.113.50" })).json();
}
let rpcId = 0;
async function call(name, args) {
  const j = await rpc({ jsonrpc: "2.0", id: ++rpcId, method: "tools/call", params: { name, arguments: args } });
  if (j.error) throw new Error(j.error.message);
  if (j.result.isError) throw new Error(j.result.content[0].text);
  return JSON.parse(j.result.content[0].text);
}
const SERVER = (await rpc({ jsonrpc: "2.0", id: ++rpcId, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "verification", version: "1" } } })).result.serverInfo;
const TOOLS = (await rpc({ jsonrpc: "2.0", id: ++rpcId, method: "tools/list", params: {} })).result.tools;

const ROWS = [];
const rad = (d) => (d * Math.PI) / 180;
/** Record one benchmark and assert it. tol is a relative tolerance in % (outputs are rounded to 0.01). */
function check({ area, tool, source, inputs, quantity, expected, got, unit = "", tol = 0.5, status = "verified", note = "" }) {
  const diff = expected === 0 ? got - expected : (100 * (got - expected)) / expected;
  ROWS.push({ area, tool, source, inputs, quantity, expected, got, unit, diffPct: expected === 0 ? null : diff, tol, status, note });
  if (expected === 0) assert.ok(Math.abs(got) < 1e-9, `${quantity}: ${got} vs 0`);
  else assert.ok(Math.abs(diff) <= tol, `${quantity}: tool ${got} vs expected ${expected} (${diff.toFixed(2)}%, tolerance ${tol}%)`);
}
test.after(() => {
  if (process.env.VERIFICATION_OUT) writeFileSync(process.env.VERIFICATION_OUT, JSON.stringify({ server: SERVER, where: REMOTE || "in process", rows: ROWS }, null, 1));
});

// ---------------------------------------------------------------------- EN 1991-1-4 wind
// Closed forms of EN 1991-1-4 §4: vb = cdir cseason cprob vb0, qb = ½ρvb², terrain II z0 = 0.05,
// kr = 0.19 (z0/0.05)^0.07, cr = kr ln(z/z0), Iv = 1/(co ln(z/z0)), qp = (1 + 7Iv) ½ρ(cr co vb)².
const RHO = 1.25;
const qp = (vb, z, z0 = 0.05) => {
  const kr = 0.19 * (z0 / 0.05) ** 0.07, cr = kr * Math.log(z / z0), iv = 1 / Math.log(z / z0);
  return (1 + 7 * iv) * 0.5 * RHO * (cr * vb) ** 2; // Pa
};
const JRC_DECK = { b: 12, d: 3.3375, L: 80, restraint: "openOne", sides: "both" }; // d = 2.8 + 0.4 − 0.025×2.5 + 0.2 (JRC p.31)
const at = (ze, d = JRC_DECK.d) => ze - d / 2; // the tool takes z_e at mid-depth of d: soffit = z_e − d/2
const fy = (out, name = "EC1W_FYpos") => out.loadCases.find((c) => c.name === name).kNperM;

test("EN 1991-1-4: JRC worked example, deck in service without traffic (z = 40 m and 10 m)", async () => {
  const src = "JRC EUR 25193, wind example §3.1 (pp. 23–31)";
  const o40 = await call("ec_wind_bridge", { vb0: 26, terrainCategory: "II", bridge: { ...JRC_DECK, groundToSoffit: at(40), cfx: 1.55 } });
  check({ area: "Wind", tool: "ec_wind_bridge", source: src, inputs: "vb,0 = 26 m/s", quantity: "q_b basic velocity pressure", expected: 0.4225, got: o40.velocity.qb_kNm2, unit: "kN/m²", tol: 1, note: "JRC 422.5 N/m²; tool output rounded to 0.01" });
  check({ area: "Wind", tool: "ec_wind_bridge", source: src, inputs: "terrain II, z_e = 40 m", quantity: "q_p(40) peak velocity pressure", expected: 1.39528, got: o40.bridge.qp_ze_kNm2, unit: "kN/m²", tol: 0.5, note: "JRC 1395.28 N/m², c_e(40) = 3.30" });
  check({ area: "Wind", tool: "ec_wind_bridge", source: "EN 1991-1-4 Table 8.1; JRC p.31", inputs: "d = 3.3375 m, open safety barrier both sides", quantity: "d_tot", expected: 3.9375, got: o40.bridge.dtot, unit: "m", tol: 0.01, note: "JRC 3.9375 m, then rounded to 4.00 m for A_ref" });
  check({ area: "Wind", tool: "ec_wind_bridge", source: src, inputs: "c_fx,0 = 1.55 (JRC, Fig. 8.3), d_tot = 3.9375 m", quantity: "transverse wind per metre F_w/L", expected: 1.39528 * 1.55 * 3.9375, got: fy(o40), unit: "kN/m", tol: 0.5,
    note: "JRC gives 8.65 kN/m with d_tot rounded up to 4.00 m; with its unrounded 3.9375 m the same equation gives 8.52 (−1.5 % from the rounding alone)" });
  check({ area: "Wind", tool: "ec_wind_bridge", source: "EN 1991-1-4 §8.3.3 NOTE 1 (c_f,z = ±0.9), eq (5.3)", inputs: "b = 12 m, z_e = 40 m", quantity: "vertical wind per metre F_z/L", expected: 1.39528 * 0.9 * 12, got: o40.loadCases.find((c) => c.name === "EC1W_FZpos_eL").kNperM, unit: "kN/m", tol: 0.5, note: "closed form; JRC does not give F_z" });
  check({ area: "Wind", tool: "ec_wind_bridge", source: "EN 1991-1-4 §8.3.4(2) (25 % of F_x for plated bridges)", inputs: "as above", quantity: "longitudinal wind per metre", expected: 0.25 * 1.39528 * 1.55 * 3.9375, got: o40.loadCases.find((c) => c.name === "EC1W_FXpos").kNperM, unit: "kN/m", tol: 1, note: "closed form" });

  const o10 = await call("ec_wind_bridge", { vb0: 26, terrainCategory: "II", bridge: { ...JRC_DECK, groundToSoffit: at(10), cfx: 1.55 } });
  check({ area: "Wind", tool: "ec_wind_bridge", source: "EN 1991-1-4 §4.3–4.5 closed form; JRC table p.41", inputs: "terrain II, z_e = 10 m", quantity: "q_p(10) peak velocity pressure", expected: qp(26, 10) / 1000, got: o10.bridge.qp_ze_kNm2, unit: "kN/m²", tol: 0.5,
    note: "closed form 993.9 N/m²; JRC tabulates 980.2 N/m² (c_e = 2.32, which takes c_r(10) = 1.0 instead of 1.0067): tool +1.4 % against the JRC figure" });
});

test("EN 1991-1-4: JRC worked example, traffic on the deck (§8.3.1(5)) and v_b,0* (§8.1(4))", async () => {
  const o = await call("ec_wind_bridge", { vb0: 26, terrainCategory: "II", bridge: { ...JRC_DECK, groundToSoffit: at(40), traffic: "road", cfx: 1.83 } });
  // JRC §3.2: d_tot* = 3.1375 + 0.2 + 2.0 = 5.3375 m, c_fx = 1.83, F_w = 2727 kN, w = 13.64 kN/m on v_b,0 = 26 m/s.
  // The tool writes the with-traffic case as the combination value F_w* of §8.1(4) on v_b,0* = 23 m/s (recommended):
  // the same equation scaled by (23/26)².
  const fyTr = fy(o, "EC1W_FYpos_tr");
  check({ area: "Wind", tool: "ec_wind_bridge", source: "JRC EUR 25193, wind example §3.2 (p.35) + EN 1991-1-4 §8.1(4)", inputs: "d_tot* = 5.3375 m, c_fx = 1.83, v_b,0* = 23 m/s",
    quantity: "transverse wind with traffic F_w*/L", expected: 1.39528 * (23 / 26) ** 2 * 1.83 * 5.3375, got: fyTr, unit: "kN/m", tol: 0.5,
    note: `JRC 13.64 kN/m is the characteristic value on 26 m/s; scaled back by (26/23)² the tool gives ${(fyTr * (26 / 23) ** 2).toFixed(2)} kN/m` });
});

test("EN 1991-1-4: JRC worked example, construction stage and c_prob", async () => {
  // JRC §3.3: steel girders alone, v_b = 14 m/s, d_tot = 2 × 2.80 = 5.60 m, c_fx = 1.9, z = 40 m.
  const o = await call("ec_wind_bridge", { vb0: 14, terrainCategory: "II", bridge: { b: 12, d: 5.6, L: 80, groundToSoffit: at(40, 5.6), cfx: 1.9 } });
  check({ area: "Wind", tool: "ec_wind_bridge", source: "JRC EUR 25193, wind example §3.3 (p.40)", inputs: "v_b = 14 m/s, z_e = 40 m", quantity: "q_p(40), construction", expected: qp(14, 40) / 1000, got: o.bridge.qp_ze_kNm2, unit: "kN/m²", tol: 1.5,
    note: "closed form 404.5 N/m²; JRC 415 N/m² rounds v_m up from 17.78 to 18 m/s (tool −2.6 % against the JRC figure)" });
  check({ area: "Wind", tool: "ec_wind_bridge", source: "JRC EUR 25193, wind example §3.3 (p.40)", inputs: "d_tot = 5.60 m, c_fx = 1.9", quantity: "transverse wind per metre, construction", expected: (qp(14, 40) / 1000) * 1.9 * 5.6, got: fy(o), unit: "kN/m", tol: 1.5,
    note: "closed form 4.30 kN/m; JRC 4.4 kN/m (618 kN / 140 m) from the rounded q_p" });
  // JRC p.39: c_prob for a 10-year return period = ((1 − 0.2 ln(−ln 0.9)) / (1 − 0.2 ln(−ln 0.98)))^0.5 = 0.902 (EN eq 4.2, K = 0.2, n = 0.5)
  const cprob = Math.sqrt((1 - 0.2 * Math.log(-Math.log(1 - 0.1))) / (1 - 0.2 * Math.log(-Math.log(0.98))));
  const p10 = await call("ec_wind_bridge", { vb0: 26, terrainCategory: "II", returnPeriodYears: 10, bridge: { ...JRC_DECK, groundToSoffit: at(40) } });
  check({ area: "Wind", tool: "ec_wind_bridge", source: "JRC EUR 25193 p.39; EN 1991-1-4 eq (4.2)", inputs: "return period 10 years, v_b,0 = 26 m/s", quantity: "v_b = c_prob · v_b,0", expected: cprob * 26, got: p10.velocity.vb, unit: "m/s", tol: 0.5, note: "JRC c_prob = 0.902" });
});

// ---------------------------------------------------------------------- EN 1991-1-5 thermal
const thermal = (kind, extra = {}) => call("bridge_thermal_calc", { code: "EN1991-1-5_2003_CEN", kind, h: kind === "composite" ? 0.25 : 1.6, D: 1.6, site: { Tmin: -15, Tmax: 34, ...(extra.site || {}) }, T0: { expansion: 10, contraction: 10 }, method: "approach1", surfacing: extra.surfacing || { mode: "mm", mm: 50 } });

test("EN 1991-1-5: uniform component, Figure 6.1 and §6.1.3.3", async () => {
  const src = "EN 1991-1-5:2003 §6.1.3.1(4) NOTE 2, Figure 6.1";
  for (const [kind, type, dMin, dMax] of [["steel_plate", "Type 1", -3, 16], ["composite", "Type 2", 4, 4], ["concrete_slab", "Type 3", 8, 2]]) {
    const u = (await thermal(kind)).uniform[0];
    check({ area: "Thermal", tool: "bridge_thermal_calc", source: src, inputs: `${type}, T_min = −15 °C`, quantity: `T_e,min ${type}`, expected: -15 + dMin, got: u.TeMin, unit: "°C", tol: 0.01 });
    check({ area: "Thermal", tool: "bridge_thermal_calc", source: src, inputs: `${type}, T_max = 34 °C`, quantity: `T_e,max ${type}`, expected: 34 + dMax, got: u.TeMax, unit: "°C", tol: 0.01 });
    check({ area: "Thermal", tool: "bridge_thermal_calc", source: "EN 1991-1-5 §6.1.3.3(3), A.1(3) NOTE (T0 = 10 °C)", inputs: `${type}, T0 = 10 °C`, quantity: `ΔT_N,con ${type}`, expected: 10 - (-15 + dMin), got: u.dTN_con, unit: "°C", tol: 0.01 });
    check({ area: "Thermal", tool: "bridge_thermal_calc", source: "EN 1991-1-5 §6.1.3.3(3)", inputs: `${type}, T0 = 10 °C`, quantity: `ΔT_N,exp ${type}`, expected: 34 + dMax - 10, got: u.dTN_exp, unit: "°C", tol: 0.01 });
  }
});

test("EN 1991-1-5: return period, Annex A.2 (A.1)/(A.2)", async () => {
  // T_max,p = T_max {k1 − k2 ln[−ln(1−p)]}, T_min,p = T_min {k3 + k4 ln[−ln(1−p)]}, k1 0.781, k2 0.056, k3 0.393, k4 −0.156; R = 100 → p = 0.01
  const L = Math.log(-Math.log(1 - 0.01));
  const tMax = 34 * (0.781 - 0.056 * L), tMin = -15 * (0.393 - 0.156 * L);
  const u = (await thermal("composite", { site: { returnYears: 100 } })).uniform[0];
  check({ area: "Thermal", tool: "bridge_thermal_calc", source: "EN 1991-1-5 Annex A.2 eq (A.1), Figure 6.1", inputs: "T_max = 34 °C, R = 100 years, composite", quantity: "T_e,max (100 years)", expected: tMax + 4, got: u.TeMax, unit: "°C", tol: 0.5 });
  check({ area: "Thermal", tool: "bridge_thermal_calc", source: "EN 1991-1-5 Annex A.2 eq (A.2), Figure 6.1", inputs: "T_min = −15 °C, R = 100 years, composite", quantity: "T_e,min (100 years)", expected: tMin + 4, got: u.TeMin, unit: "°C", tol: 0.5 });
});

test("EN 1991-1-5: linear temperature difference, Tables 6.1 and 6.2", async () => {
  for (const [kind, surfacing, heat, cool, label] of [
    ["composite", { mode: "mm", mm: 50 }, 15, 18, "Type 2, 50 mm"],
    ["concrete_slab", { mode: "mm", mm: 150 }, 15 * 0.5, 8 * 1.0, "Type 3 slab, 150 mm (k_sur 0.5 / 1.0)"],
    ["steel_plate", { mode: "unsurfaced" }, 18 * 0.7, 13 * 0.9, "Type 1, unsurfaced (k_sur 0.7 / 0.9)"],
    ["concrete_box", { mode: "waterproofed" }, 10 * 1.5, 5 * 1.0, "Type 3 box, waterproofed (k_sur 1.5 / 1.0)"],
  ]) {
    const s = (await thermal(kind, { surfacing })).sections[0].approach1_topMinusBottom;
    check({ area: "Thermal", tool: "bridge_thermal_calc", source: "EN 1991-1-5 Table 6.1 × Table 6.2", inputs: label, quantity: `ΔT_M,heat ${label}`, expected: heat, got: s.heating, unit: "°C", tol: 0.01 });
    check({ area: "Thermal", tool: "bridge_thermal_calc", source: "EN 1991-1-5 Table 6.1 × Table 6.2", inputs: label, quantity: `ΔT_M,cool ${label}`, expected: -cool, got: s.cooling, unit: "°C", tol: 0.01 });
  }
});

// ---------------------------------------------------------------------- EN 1991-2 traffic
test("EN 1991-2 Table 4.1: number and width of notional lanes", async () => {
  for (const w of [4.5, 5.0, 5.4, 5.8, 6.0, 9.0, 11.0, 14.5]) {
    const n = w < 5.4 ? 1 : w < 6 ? 2 : Math.floor(w / 3);
    const width = w >= 5.4 && w < 6 ? w / 2 : 3;
    const got = (await call("ec_lane_layout", { section: { width: w } })).notionalLanes;
    check({ area: "Traffic", tool: "ec_lane_layout", source: "EN 1991-2 Table 4.1", inputs: `w = ${w} m`, quantity: `n_l at w = ${w} m`, expected: n, got: got.count, tol: 0.01 });
    check({ area: "Traffic", tool: "ec_lane_layout", source: "EN 1991-2 Table 4.1", inputs: `w = ${w} m`, quantity: `lane width at w = ${w} m`, expected: width, got: got.laneWidth, unit: "m", tol: 0.01 });
    check({ area: "Traffic", tool: "ec_lane_layout", source: "EN 1991-2 Table 4.1", inputs: `w = ${w} m`, quantity: `remaining area at w = ${w} m`, expected: +(w - n * width).toFixed(6), got: +got.remaining.toFixed(6), unit: "m", tol: 0.01 });
  }
});

test("CS 454: ALL model 1 lanes (cl 5.10, Table 5.9a) and ALL model 2 lane count (Eq 5.18, Table 5.18)", async () => {
  // Table 5.18 limits (C in m): nmin, nmax
  const limits = (C) => C < 5 ? [1, 2] : C < 7.5 ? [2, 2] : C === 7.5 ? [2, 3] : C < 10 ? [3, 3] : C <= 10.95 ? [3, 4] : C < 12.5 ? [4, 4] : C <= 14.6 ? [4, 5] : C < 15 ? [5, 5] : C < 17.5 ? [5, 6] : C <= 18.25 ? [5, 7] : C < 20 ? [6, 7] : [6, 8];
  const lanesOf = (o) => o.lanes.filter((l) => l.role === "CARRIAGEWAY");
  for (const [C, marked] of [[4.5, 1], [7.3, 2], [7.5, 1], [7.5, 4], [10.5, 3], [11, 3], [13, 6], [16, 4], [20, 3]]) {
    const s1 = lanesOf(await call("cs454_lane_layout", { section: { width: C, markedLanes: marked }, lanes: { picked: ["M1S"] } }));
    check({ area: "Traffic", tool: "cs454_lane_layout", source: "CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle)", inputs: `C = ${C} m`, quantity: `ALL model 1 single: lanes at C = ${C} m`, expected: Math.floor(C / 3 + 1e-9), got: s1.length, tol: 0.01 });
    const cv = lanesOf(await call("cs454_lane_layout", { section: { width: C, markedLanes: marked }, lanes: { picked: ["M1C"] } }));
    check({ area: "Traffic", tool: "cs454_lane_layout", source: "CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy)", inputs: `C = ${C} m`, quantity: `ALL model 1 convoy: lanes at C = ${C} m`, expected: Math.floor(C / 2.5 + 1e-9), got: cv.length, tol: 0.01 });
    const [lo, hi] = limits(C);
    const m2 = lanesOf(await call("cs454_lane_layout", { section: { width: C, markedLanes: marked }, lanes: { picked: ["M2"] } }));
    check({ area: "Traffic", tool: "cs454_lane_layout", source: "CS 454 v1.1.0 Equation 5.18, Table 5.18", inputs: `C = ${C} m, ${marked} marked lanes`, quantity: `ALL model 2: notional lanes at C = ${C} m, n_m = ${marked}`, expected: Math.min(hi, Math.max(lo, marked)), got: m2.length, tol: 0.01 });
  }
});

test("EN 1991-2 §4.3.6: dispersal of wheel loads to the slab mid-plane", async () => {
  for (const [preset, load, b0, l0, ts, tc] of [["EC_LM1_TS", 150, 0.4, 0.4, 0.1, 0.25], ["EC_LM2", 200, 0.6, 0.35, 0.1, 0.2]]) {
    const o = await call("point_to_patch_dispersal", { presetId: preset, load, ts, tc });
    const b = b0 + 2 * ts + tc, l = l0 + 2 * ts + tc; // 1:1 through surfacing and to the mid-plane of the slab
    const src = preset === "EC_LM2" ? "EN 1991-2 §4.3.3 (0.60 × 0.35 m), §4.3.6 Fig 4.5" : "EN 1991-2 §4.3.2 (0.40 m square), §4.3.6 Fig 4.5";
    check({ area: "Traffic", tool: "point_to_patch_dispersal", source: src, inputs: `${preset}, surfacing ${ts} m, slab ${tc} m`, quantity: `${preset} dispersed width (transverse)`, expected: b, got: o.effective.bEff, unit: "m", tol: 0.01 });
    check({ area: "Traffic", tool: "point_to_patch_dispersal", source: src, inputs: `${preset}, surfacing ${ts} m, slab ${tc} m`, quantity: `${preset} dispersed length`, expected: l, got: o.effective.lEff, unit: "m", tol: 0.01 });
    check({ area: "Traffic", tool: "point_to_patch_dispersal", source: src, inputs: `${preset}, ${load} kN`, quantity: `${preset} pressure (load kept)`, expected: load / (b * l), got: o.effective.pressure_kNm2, unit: "kN/m²", tol: 0.01 });
  }
});

// ---------------------------------------------------------------------- EN 1992-1-1 slab bending
test("EN 1992-1-1 §3.1.7 rectangular stress block: slab moment capacity per metre", async () => {
  for (const c of [
    { h: 250, fck: 30, alpha_cc: 1.0, cover: 30, outer: [16, 150], inner: [12, 200] },
    { h: 300, fck: 40, alpha_cc: undefined, cover: 40, outer: [20, 125], inner: [16, 200] },
  ]) {
    const out = await call("slab_capacities_from_bars", { thickness_mm: c.h, fck: c.fck, ...(c.alpha_cc ? { alpha_cc: c.alpha_cc } : {}),
      bottom: { cover_mm: c.cover, layers: [{ dia: c.outer[0], spacing: c.outer[1], angle: 0, outer: true }, { dia: c.inner[0], spacing: c.inner[1], angle: 90 }] } });
    const acc = c.alpha_cc ?? 0.85, fcd = (acc * c.fck) / 1.5, fyd = 500 / 1.15; // λ = 0.8, η = 1 for fck ≤ 50
    for (const [i, [dia, s], d] of [[0, c.outer, c.h - c.cover - c.outer[0] / 2], [1, c.inner, c.h - c.cover - c.outer[0] - c.inner[0] / 2]]) {
      const As = (Math.PI * dia * dia / 4) * 1000 / s, x = (As * fyd) / (fcd * 0.8 * 1000), M = (As * fyd * (d - 0.4 * x)) / 1e6;
      const lay = out.bottom.layers[i];
      const label = `h ${c.h}, C${c.fck}, α_cc ${acc}, H${dia}@${s}`;
      check({ area: "Concrete", tool: "slab_capacities_from_bars", source: "EN 1992-1-1 §3.1.7(3), §6.1 (λ 0.8, η 1, γc 1.5, γs 1.15)", inputs: label, quantity: `neutral axis x, ${label}`, expected: x, got: lay.x_mm, unit: "mm", tol: 0.1 });
      check({ area: "Concrete", tool: "slab_capacities_from_bars", source: "EN 1992-1-1 §3.1.7(3), §6.1", inputs: label, quantity: `M_Rd, ${label}`, expected: M, got: lay.moment_knm_per_m, unit: "kNm/m", tol: 0.1 });
    }
  }
});

// ---------------------------------------------------------------------- section properties
test("Section properties: closed forms (rectangle, T, tube)", async () => {
  const rect = (b, h) => [[-b / 2, -h / 2], [b / 2, -h / 2], [b / 2, h / 2], [-b / 2, h / 2]];
  const r = (await call("section_properties", { section: { name: "R", parts: [{ regions: [{ outer: rect(500, 300) }] }] } })).properties;
  check({ area: "Sections", tool: "section_properties", source: "closed form", inputs: "rectangle 500 × 300 mm", quantity: "rectangle area", expected: 150000, got: r.AREA, unit: "mm²", tol: 0.01 });
  check({ area: "Sections", tool: "section_properties", source: "closed form bh³/12", inputs: "rectangle 500 × 300 mm", quantity: "rectangle I (strong)", expected: (500 * 300 ** 3) / 12, got: r.RYY, unit: "mm⁴", tol: 0.01 });
  check({ area: "Sections", tool: "section_properties", source: "closed form hb³/12", inputs: "rectangle 500 × 300 mm", quantity: "rectangle I (weak)", expected: (300 * 500 ** 3) / 12, got: r.RZZ, unit: "mm⁴", tol: 0.01 });
  let series = 0;
  for (let n = 1; n < 200; n += 2) series += Math.tanh((n * Math.PI * 500) / (2 * 300)) / n ** 5;
  check({ area: "Sections", tool: "section_properties", source: "Saint-Venant torsion series (Timoshenko & Goodier)", inputs: "rectangle 500 × 300 mm", quantity: "rectangle torsion constant J", expected: ((300 ** 3 * 500) / 3) * (1 - ((192 / Math.PI ** 5) * 300 * series) / 500), got: r.RXX, unit: "mm⁴", tol: 0.2, note: "FE mesh" });

  // T: 1000 × 200 flange on a 200 × 800 web. ȳ = 677.78 from the base; I by the parallel-axis theorem.
  const T_ = [[-100, 0], [100, 0], [100, 800], [500, 800], [500, 1000], [-500, 1000], [-500, 800], [-100, 800]];
  const t = (await call("section_properties", { section: { name: "T", parts: [{ regions: [{ outer: T_ }] }] } })).properties;
  const A1 = 1000 * 200, A2 = 200 * 800, yb = (A1 * 900 + A2 * 400) / (A1 + A2);
  const Iy = (1000 * 200 ** 3) / 12 + A1 * (900 - yb) ** 2 + (200 * 800 ** 3) / 12 + A2 * (400 - yb) ** 2;
  check({ area: "Sections", tool: "section_properties", source: "closed form (parallel axes)", inputs: "T 1000×200 flange, 200×800 web", quantity: "T-section area", expected: A1 + A2, got: t.AREA, unit: "mm²", tol: 0.01 });
  check({ area: "Sections", tool: "section_properties", source: "closed form (parallel axes)", inputs: "T 1000×200 flange, 200×800 web", quantity: "T-section I (strong)", expected: Iy, got: t.RYY, unit: "mm⁴", tol: 0.01 });
  check({ area: "Sections", tool: "section_properties", source: "closed form", inputs: "T 1000×200 flange, 200×800 web", quantity: "T-section I (weak)", expected: (200 * 1000 ** 3) / 12 + (800 * 200 ** 3) / 12, got: t.RZZ, unit: "mm⁴", tol: 0.01 });

  const tube = (await call("section_properties", { section: { name: "C", units: "m", parts: [{ regions: [{ outer: { circle: { centre: [0, 0], radius: 0.5 } }, holes: [{ circle: { centre: [0, 0], radius: 0.4 } }] }] }] } })).properties;
  check({ area: "Sections", tool: "section_properties", source: "closed form π(R⁴ − r⁴)/2", inputs: "tube R 0.5 / r 0.4 m", quantity: "tube torsion constant J", expected: (Math.PI * (0.5 ** 4 - 0.4 ** 4)) / 2, got: tube.RXX, unit: "m⁴", tol: 1, note: "circles drawn as 48-gons" });
});

// ---------------------------------------------------------------------- PD 6694-1
test("PD 6694-1: Route A movement and K* (cl 9.4.2, 9.4.3), and K_p;t against Table 7", async () => {
  // Deck 60 m long shared by 2 abutments → L_x = 30 m; ΔT = 37 − (−2) = 39 °C; α = 12e-6.
  // expansionLength is the whole deck (as the plugin's own field), not PD's L_x: the description must say so,
  // or a caller entering L_x with 2 abutments sharing gets half the movement.
  const schema = TOOLS.find((t) => t.name === "pd6694_route_a").inputSchema.properties;
  assert.match(schema.expansionLength.description, /WHOLE deck.*L_x.*= expansionLength \/ nAbutmentsSharing/s);
  const o = await call("pd6694_route_a", { expansionLength: 60, nAbutmentsSharing: 2, gammaQ: 1.5, abutment: { retainedHeight: 6, loadedWidth: 10 } });
  const dk = 12e-6 * 30 * 39, dd = 0.5 * dk * (1 + 1 * 1.5);
  check({ area: "Earth pressure", tool: "pd6694_route_a", source: "PD 6694-1:2011+A1:2020 cl 9.4.2", inputs: "L_x = 30 m, ΔT 39 °C, α 12×10⁻⁶", quantity: "d_k = α L_x (T_e,max − T_e,min)", expected: dk, got: o.movement.dK, unit: "m", tol: 0.01 });
  check({ area: "Earth pressure", tool: "pd6694_route_a", source: "PD 6694-1 cl 9.4.2", inputs: "ψ 1, γ_Q 1.5", quantity: "d_d = ½ d_k (1 + ψ γ_Q)", expected: dd, got: o.designDisplacement.value, unit: "m", tol: 0.01 });
  check({ area: "Earth pressure", tool: "pd6694_route_a", source: "K0 = 1 − sin φ' (Jaky)", inputs: "φ'peak 35°", quantity: "K0", expected: 1 - Math.sin(rad(35)), got: o.coefficients.k0, tol: 0.01 });
  const kStar = o.coefficients.k0 + ((20 * dd) / 6) ** 0.6 * o.coefficients.kpT;
  check({ area: "Earth pressure", tool: "pd6694_route_a", source: "PD 6694-1 cl 9.4.3 (C = 20, exponent 0.6)", inputs: "H = 6 m, the tool's K0 and K_p;t", quantity: "K*_d = K0 + (C d'_d/H)^0.6 K_p;t", expected: kStar, got: o.states.EXPMAX.kStar, tol: 0.1, note: "checks the equation; K_p;t itself is the next row" });
  // Table 7 (vertical face, φ'triax,d = 35°): K_p;t = 5.88, the horizontal component with δ/φ' = 0.5 from BS EN 1997-1 Annex C.
  // The engine's default is Coulomb with δ = φ'/2 (7.36): higher than the table, so K* and the pressures come out higher.
  check({ area: "Earth pressure", tool: "pd6694_route_a", source: "PD 6694-1 cl 9.4.1, Table 7", inputs: "φ' 35°, vertical face", quantity: "K_p;t", expected: 5.88, got: o.coefficients.kpT, tol: 26, status: "deviation",
    note: "the engine uses Coulomb (δ = φ'/2), 25 % above Table 7: K* and the expansion pressures are higher than the code's (conservative); fix pending in the PD 6694 plugin" });
});

test("summary", () => {
  assert.ok(ROWS.length > 80, `${ROWS.length} rows`);
  assert.deepEqual(ROWS.filter((r) => r.status === "deviation").map((r) => r.quantity), ["K_p;t"]);
});
