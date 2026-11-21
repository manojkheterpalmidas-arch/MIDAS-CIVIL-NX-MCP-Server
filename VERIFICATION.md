# Verification of the calculation tools

The tools run the same engines as the MIDAS IT Europe plugins, and each plugin has its own test suite. Those suites were written by the same people as the engines, though. This page records checks against sources that did not come from us: a published worked example, the code's own tables and equations, and closed-form mechanics. Each number in the "Expected" column below was worked out from the source, not taken from a plugin.

**Result:** 111 checks on 8 calculation tools. All 111 agree within the stated tolerance. Last run: 2026-11-21, server 0.8.0, against https://midasiteurope.com/mcp.

While building this pack we found and fixed three problems:

- **The Python-backed tools failed on the hosted server.** CS 455, 2D Culvert, RC Slab and the Eurocode Section Checker run under Pyodide. The hosted functions were missing part of the Pyodide package, so these tools answered with "Cannot find module … pyodide.asm.js". Fixed with server 0.8.0.
- **One input description could halve a movement.** `pd6694_route_a` takes `expansionLength` as the whole deck, shared between `nAbutmentsSharing` abutments, as the plugin does. Its description said "length to the point of zero movement", which is PD 6694's L_x. Anyone who followed it, with two abutments sharing, would have got half the thermal movement. The description now says what the engine does, and a check below guards it.
- **PD 6694 K_p;t was higher than Table 7.** For the limit-equilibrium route the engine used Coulomb's passive coefficient with δ = φ'/2: 7.36 at φ' = 35°, where PD 6694-1 Table 7 gives 5.88. K_p;t was 25 % above the table, which made K*_d and the maximum-expansion pressure about 17 % higher than the code's (conservative, but not what PD 6694 says). From PD 6694-1 Integral Abutment 0.9.1, K_p;t comes from the BS EN 1997-1 Annex C log spiral with δ/φ' = 0.5, which is how Table 7 is derived and reproduces it. The Annex A SSI route already did this. Coulomb stays available as an explicit choice.

## Run it yourself

The checks are a single test file with no dependencies (Node 18 or later). The calculation tools need no account or key.

```
node --test verification/verify.test.mjs
```

It calls `https://midasiteurope.com/mcp` by default. Set `CIVIL_MCP_URL` to test another address, and `VERIFICATION_OUT=results.json` to save every row with the tool's output. A failing row prints the tool's value, the expected value and the difference.

## Sources

| Source | Used for |
|---|---|
| JRC, *Bridge Design to Eurocodes: Worked examples*, EUR 25193 EN (2012), the EN 1991 actions chapter, "Example of application: wind actions on bridge deck and piers". A three-span 60 + 80 + 60 m composite deck, 12 m wide, on piers 10 m and 40 m high. Published free by the European Commission's Joint Research Centre at [eurocodes.jrc.ec.europa.eu](https://eurocodes.jrc.ec.europa.eu). | Wind: q_b, q_p(z), d_tot, the transverse force with and without traffic, the construction stage, c_prob |
| EN 1991-1-4:2005 §4, §8 (recommended values, no National Annex) | Wind closed forms, vertical and longitudinal forces |
| EN 1991-1-5:2003 §6.1, Figure 6.1, Tables 6.1 and 6.2, Annex A.2 | Thermal: uniform component for all three deck types, return period, linear temperature difference with k_sur |
| EN 1991-2:2003 Table 4.1, §4.3.2, §4.3.3, §4.3.6 | Notional lanes, wheel contact areas and dispersal |
| CS 454 v1.1.0 cl 5.10, Table 5.9a, Equation 5.18, Table 5.18 | CS 454 lanes for ALL models 1 and 2 |
| EN 1992-1-1:2004 §3.1.7, §6.1 | Rectangular stress block: neutral axis and moment of resistance of a slab |
| PD 6694-1:2011+A1:2020 cl 9.4.1–9.4.3, Table 7 | Integral abutment movement, K*_d and K_p;t |
| Closed-form mechanics | Section area, second moments (parallel-axis theorem) and torsion constants |

The worked example is cited by reference and only its numbers are reproduced. We had also planned to use the European Concrete Platform's *Eurocode 2 Worked Examples*. We found no official free download of it, and its text may not be reproduced, so the EN 1992 checks use the code's equations instead.

**Internal checks, not counted here.** The Wind Load Calculator, Bridge Thermal Loads and CS 455 plugins export Excel calculation sheets whose live formulas recompute every value, and each plugin has its own test suite. They catch slips, but the same people wrote them as the engines, so they are not independent.

## Results

Tolerances are relative. Most tool outputs are rounded to 0.01, so a value such as 0.40 kN/m² can be up to about 1 % from the unrounded figure; integer and table values must match exactly (tolerance 0.01 %).

| Area | Checks | Tools | Largest difference |
|---|---|---|---|
| Wind | 11 | `ec_wind_bridge` | 1.12 % |
| Thermal | 22 | `bridge_thermal_calc` | 0.32 % |
| Traffic | 57 | `ec_lane_layout`, `cs454_lane_layout`, `point_to_patch_dispersal` | 0.00 % |
| Concrete | 8 | `slab_capacities_from_bars` | 0.00 % |
| Sections | 8 | `section_properties` | 0.59 % |
| Earth pressure | 5 | `pd6694_route_a` | 0.02 % |

### Wind

| Check | Tool | Source | Inputs | Expected | Tool output | Diff % | Tol. % | Note |
|---|---|---|---|---|---|---|---|---|
| q_b basic velocity pressure | `ec_wind_bridge` | JRC EUR 25193, wind example §3.1 (pp. 23–31) | vb,0 = 26 m/s | 0.4225 kN/m² | 0.42 kN/m² | −0.59 | 1 | JRC 422.5 N/m²; tool output rounded to 0.01 |
| q_p(40) peak velocity pressure | `ec_wind_bridge` | JRC EUR 25193, wind example §3.1 (pp. 23–31) | terrain II, z_e = 40 m | 1.3953 kN/m² | 1.4 kN/m² | +0.34 | 0.5 | JRC 1395.28 N/m², c_e(40) = 3.30 |
| d_tot | `ec_wind_bridge` | EN 1991-1-4 Table 8.1; JRC p.31 | d = 3.3375 m, open safety barrier both sides | 3.9375 m | 3.9375 m | 0.00 | 0.01 | JRC 3.9375 m, then rounded to 4.00 m for A_ref |
| transverse wind per metre F_w/L | `ec_wind_bridge` | JRC EUR 25193, wind example §3.1 (pp. 23–31) | c_fx,0 = 1.55 (JRC, Fig. 8.3), d_tot = 3.9375 m | 8.5156 kN/m | 8.52 kN/m | +0.05 | 0.5 | JRC gives 8.65 kN/m with d_tot rounded up to 4.00 m; with its unrounded 3.9375 m the same equation gives 8.52 (−1.5 % from the rounding alone) |
| vertical wind per metre F_z/L | `ec_wind_bridge` | EN 1991-1-4 §8.3.3 NOTE 1 (c_f,z = ±0.9), eq (5.3) | b = 12 m, z_e = 40 m | 15.069 kN/m | 15.07 kN/m | +0.01 | 0.5 | closed form; JRC does not give F_z |
| longitudinal wind per metre | `ec_wind_bridge` | EN 1991-1-4 §8.3.4(2) (25 % of F_x for plated bridges) | as above | 2.1289 kN/m | 2.13 kN/m | +0.05 | 1 | closed form |
| q_p(10) peak velocity pressure | `ec_wind_bridge` | EN 1991-1-4 §4.3–4.5 closed form; JRC table p.41 | terrain II, z_e = 10 m | 0.99384 kN/m² | 0.99 kN/m² | −0.39 | 0.5 | closed form 993.9 N/m²; JRC tabulates 980.2 N/m² (c_e = 2.32, which takes c_r(10) = 1.0 instead of 1.0067): tool +1.4 % against the JRC figure |
| transverse wind with traffic F_w*/L | `ec_wind_bridge` | JRC EUR 25193, wind example §3.2 (p.35) + EN 1991-1-4 §8.1(4) | d_tot* = 5.3375 m, c_fx = 1.83, v_b,0* = 23 m/s | 10.665 kN/m | 10.66 kN/m | −0.05 | 0.5 | JRC 13.64 kN/m is the characteristic value on 26 m/s; scaled back by (26/23)² the tool gives 13.62 kN/m |
| q_p(40), construction | `ec_wind_bridge` | JRC EUR 25193, wind example §3.3 (p.40) | v_b = 14 m/s, z_e = 40 m | 0.40453 kN/m² | 0.4 kN/m² | −1.12 | 1.5 | closed form 404.5 N/m²; JRC 415 N/m² rounds v_m up from 17.78 to 18 m/s (tool −2.6 % against the JRC figure) |
| transverse wind per metre, construction | `ec_wind_bridge` | JRC EUR 25193, wind example §3.3 (p.40) | d_tot = 5.60 m, c_fx = 1.9 | 4.3042 kN/m | 4.3 kN/m | −0.10 | 1.5 | closed form 4.30 kN/m; JRC 4.4 kN/m (618 kN / 140 m) from the rounded q_p |
| v_b = c_prob · v_b,0 | `ec_wind_bridge` | JRC EUR 25193 p.39; EN 1991-1-4 eq (4.2) | return period 10 years, v_b,0 = 26 m/s | 23.464 m/s | 23.464 m/s | 0.00 | 0.5 | JRC c_prob = 0.902 |

### Thermal

| Check | Tool | Source | Inputs | Expected | Tool output | Diff % | Tol. % | Note |
|---|---|---|---|---|---|---|---|---|
| T_e,min Type 1 | `bridge_thermal_calc` | EN 1991-1-5:2003 §6.1.3.1(4) NOTE 2, Figure 6.1 | Type 1, T_min = −15 °C | -18 °C | -18 °C | 0.00 | 0.01 |  |
| T_e,max Type 1 | `bridge_thermal_calc` | EN 1991-1-5:2003 §6.1.3.1(4) NOTE 2, Figure 6.1 | Type 1, T_max = 34 °C | 50 °C | 50 °C | 0.00 | 0.01 |  |
| ΔT_N,con Type 1 | `bridge_thermal_calc` | EN 1991-1-5 §6.1.3.3(3), A.1(3) NOTE (T0 = 10 °C) | Type 1, T0 = 10 °C | 28 °C | 28 °C | 0.00 | 0.01 |  |
| ΔT_N,exp Type 1 | `bridge_thermal_calc` | EN 1991-1-5 §6.1.3.3(3) | Type 1, T0 = 10 °C | 40 °C | 40 °C | 0.00 | 0.01 |  |
| T_e,min Type 2 | `bridge_thermal_calc` | EN 1991-1-5:2003 §6.1.3.1(4) NOTE 2, Figure 6.1 | Type 2, T_min = −15 °C | -11 °C | -11 °C | 0.00 | 0.01 |  |
| T_e,max Type 2 | `bridge_thermal_calc` | EN 1991-1-5:2003 §6.1.3.1(4) NOTE 2, Figure 6.1 | Type 2, T_max = 34 °C | 38 °C | 38 °C | 0.00 | 0.01 |  |
| ΔT_N,con Type 2 | `bridge_thermal_calc` | EN 1991-1-5 §6.1.3.3(3), A.1(3) NOTE (T0 = 10 °C) | Type 2, T0 = 10 °C | 21 °C | 21 °C | 0.00 | 0.01 |  |
| ΔT_N,exp Type 2 | `bridge_thermal_calc` | EN 1991-1-5 §6.1.3.3(3) | Type 2, T0 = 10 °C | 28 °C | 28 °C | 0.00 | 0.01 |  |
| T_e,min Type 3 | `bridge_thermal_calc` | EN 1991-1-5:2003 §6.1.3.1(4) NOTE 2, Figure 6.1 | Type 3, T_min = −15 °C | -7 °C | -7 °C | 0.00 | 0.01 |  |
| T_e,max Type 3 | `bridge_thermal_calc` | EN 1991-1-5:2003 §6.1.3.1(4) NOTE 2, Figure 6.1 | Type 3, T_max = 34 °C | 36 °C | 36 °C | 0.00 | 0.01 |  |
| ΔT_N,con Type 3 | `bridge_thermal_calc` | EN 1991-1-5 §6.1.3.3(3), A.1(3) NOTE (T0 = 10 °C) | Type 3, T0 = 10 °C | 17 °C | 17 °C | 0.00 | 0.01 |  |
| ΔT_N,exp Type 3 | `bridge_thermal_calc` | EN 1991-1-5 §6.1.3.3(3) | Type 3, T0 = 10 °C | 26 °C | 26 °C | 0.00 | 0.01 |  |
| T_e,max (100 years) | `bridge_thermal_calc` | EN 1991-1-5 Annex A.2 eq (A.1), Figure 6.1 | T_max = 34 °C, R = 100 years, composite | 39.313 °C | 39.3 °C | −0.03 | 0.5 |  |
| T_e,min (100 years) | `bridge_thermal_calc` | EN 1991-1-5 Annex A.2 eq (A.2), Figure 6.1 | T_min = −15 °C, R = 100 years, composite | -12.659 °C | -12.7 °C | +0.32 | 0.5 |  |
| ΔT_M,heat Type 2, 50 mm | `bridge_thermal_calc` | EN 1991-1-5 Table 6.1 × Table 6.2 | Type 2, 50 mm | 15 °C | 15 °C | 0.00 | 0.01 |  |
| ΔT_M,cool Type 2, 50 mm | `bridge_thermal_calc` | EN 1991-1-5 Table 6.1 × Table 6.2 | Type 2, 50 mm | -18 °C | -18 °C | 0.00 | 0.01 |  |
| ΔT_M,heat Type 3 slab, 150 mm (k_sur 0.5 / 1.0) | `bridge_thermal_calc` | EN 1991-1-5 Table 6.1 × Table 6.2 | Type 3 slab, 150 mm (k_sur 0.5 / 1.0) | 7.5 °C | 7.5 °C | 0.00 | 0.01 |  |
| ΔT_M,cool Type 3 slab, 150 mm (k_sur 0.5 / 1.0) | `bridge_thermal_calc` | EN 1991-1-5 Table 6.1 × Table 6.2 | Type 3 slab, 150 mm (k_sur 0.5 / 1.0) | -8 °C | -8 °C | 0.00 | 0.01 |  |
| ΔT_M,heat Type 1, unsurfaced (k_sur 0.7 / 0.9) | `bridge_thermal_calc` | EN 1991-1-5 Table 6.1 × Table 6.2 | Type 1, unsurfaced (k_sur 0.7 / 0.9) | 12.6 °C | 12.6 °C | 0.00 | 0.01 |  |
| ΔT_M,cool Type 1, unsurfaced (k_sur 0.7 / 0.9) | `bridge_thermal_calc` | EN 1991-1-5 Table 6.1 × Table 6.2 | Type 1, unsurfaced (k_sur 0.7 / 0.9) | -11.7 °C | -11.7 °C | 0.00 | 0.01 |  |
| ΔT_M,heat Type 3 box, waterproofed (k_sur 1.5 / 1.0) | `bridge_thermal_calc` | EN 1991-1-5 Table 6.1 × Table 6.2 | Type 3 box, waterproofed (k_sur 1.5 / 1.0) | 15 °C | 15 °C | 0.00 | 0.01 |  |
| ΔT_M,cool Type 3 box, waterproofed (k_sur 1.5 / 1.0) | `bridge_thermal_calc` | EN 1991-1-5 Table 6.1 × Table 6.2 | Type 3 box, waterproofed (k_sur 1.5 / 1.0) | -5 °C | -5 °C | 0.00 | 0.01 |  |

### Traffic

| Check | Tool | Source | Inputs | Expected | Tool output | Diff % | Tol. % | Note |
|---|---|---|---|---|---|---|---|---|
| n_l at w = 4.5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 4.5 m | 1 | 1 | 0.00 | 0.01 |  |
| lane width at w = 4.5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 4.5 m | 3 m | 3 m | 0.00 | 0.01 |  |
| remaining area at w = 4.5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 4.5 m | 1.5 m | 1.5 m | 0.00 | 0.01 |  |
| n_l at w = 5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5 m | 1 | 1 | 0.00 | 0.01 |  |
| lane width at w = 5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5 m | 3 m | 3 m | 0.00 | 0.01 |  |
| remaining area at w = 5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5 m | 2 m | 2 m | 0.00 | 0.01 |  |
| n_l at w = 5.4 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5.4 m | 2 | 2 | 0.00 | 0.01 |  |
| lane width at w = 5.4 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5.4 m | 2.7 m | 2.7 m | 0.00 | 0.01 |  |
| remaining area at w = 5.4 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5.4 m | 0 m | 0 m | 0.00 | 0.01 |  |
| n_l at w = 5.8 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5.8 m | 2 | 2 | 0.00 | 0.01 |  |
| lane width at w = 5.8 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5.8 m | 2.9 m | 2.9 m | 0.00 | 0.01 |  |
| remaining area at w = 5.8 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 5.8 m | 0 m | 0 m | 0.00 | 0.01 |  |
| n_l at w = 6 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 6 m | 2 | 2 | 0.00 | 0.01 |  |
| lane width at w = 6 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 6 m | 3 m | 3 m | 0.00 | 0.01 |  |
| remaining area at w = 6 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 6 m | 0 m | 0 m | 0.00 | 0.01 |  |
| n_l at w = 9 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 9 m | 3 | 3 | 0.00 | 0.01 |  |
| lane width at w = 9 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 9 m | 3 m | 3 m | 0.00 | 0.01 |  |
| remaining area at w = 9 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 9 m | 0 m | 0 m | 0.00 | 0.01 |  |
| n_l at w = 11 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 11 m | 3 | 3 | 0.00 | 0.01 |  |
| lane width at w = 11 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 11 m | 3 m | 3 m | 0.00 | 0.01 |  |
| remaining area at w = 11 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 11 m | 2 m | 2 m | 0.00 | 0.01 |  |
| n_l at w = 14.5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 14.5 m | 4 | 4 | 0.00 | 0.01 |  |
| lane width at w = 14.5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 14.5 m | 3 m | 3 m | 0.00 | 0.01 |  |
| remaining area at w = 14.5 m | `ec_lane_layout` | EN 1991-2 Table 4.1 | w = 14.5 m | 2.5 m | 2.5 m | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 4.5 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 4.5 m | 1 | 1 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 4.5 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 4.5 m | 1 | 1 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 4.5 m, n_m = 1 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 4.5 m, 1 marked lanes | 1 | 1 | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 7.3 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 7.3 m | 2 | 2 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 7.3 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 7.3 m | 2 | 2 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 7.3 m, n_m = 2 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 7.3 m, 2 marked lanes | 2 | 2 | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 7.5 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 7.5 m | 2 | 2 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 7.5 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 7.5 m | 3 | 3 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 7.5 m, n_m = 1 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 7.5 m, 1 marked lanes | 2 | 2 | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 7.5 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 7.5 m | 2 | 2 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 7.5 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 7.5 m | 3 | 3 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 7.5 m, n_m = 4 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 7.5 m, 4 marked lanes | 3 | 3 | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 10.5 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 10.5 m | 3 | 3 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 10.5 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 10.5 m | 4 | 4 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 10.5 m, n_m = 3 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 10.5 m, 3 marked lanes | 3 | 3 | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 11 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 11 m | 3 | 3 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 11 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 11 m | 4 | 4 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 11 m, n_m = 3 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 11 m, 3 marked lanes | 4 | 4 | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 13 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 13 m | 4 | 4 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 13 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 13 m | 5 | 5 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 13 m, n_m = 6 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 13 m, 6 marked lanes | 5 | 5 | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 16 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 16 m | 5 | 5 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 16 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 16 m | 6 | 6 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 16 m, n_m = 4 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 16 m, 4 marked lanes | 5 | 5 | 0.00 | 0.01 |  |
| ALL model 1 single: lanes at C = 20 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (3 m, single vehicle) | C = 20 m | 6 | 6 | 0.00 | 0.01 |  |
| ALL model 1 convoy: lanes at C = 20 m | `cs454_lane_layout` | CS 454 v1.1.0 cl 5.10, Table 5.9a (2.5 m, convoy) | C = 20 m | 8 | 8 | 0.00 | 0.01 |  |
| ALL model 2: notional lanes at C = 20 m, n_m = 3 | `cs454_lane_layout` | CS 454 v1.1.0 Equation 5.18, Table 5.18 | C = 20 m, 3 marked lanes | 6 | 6 | 0.00 | 0.01 |  |
| EC_LM1_TS dispersed width (transverse) | `point_to_patch_dispersal` | EN 1991-2 §4.3.2 (0.40 m square), §4.3.6 Fig 4.5 | EC_LM1_TS, surfacing 0.1 m, slab 0.25 m | 0.85 m | 0.85 m | 0.00 | 0.01 |  |
| EC_LM1_TS dispersed length | `point_to_patch_dispersal` | EN 1991-2 §4.3.2 (0.40 m square), §4.3.6 Fig 4.5 | EC_LM1_TS, surfacing 0.1 m, slab 0.25 m | 0.85 m | 0.85 m | 0.00 | 0.01 |  |
| EC_LM1_TS pressure (load kept) | `point_to_patch_dispersal` | EN 1991-2 §4.3.2 (0.40 m square), §4.3.6 Fig 4.5 | EC_LM1_TS, 150 kN | 207.61 kN/m² | 207.61 kN/m² | 0.00 | 0.01 |  |
| EC_LM2 dispersed width (transverse) | `point_to_patch_dispersal` | EN 1991-2 §4.3.3 (0.60 × 0.35 m), §4.3.6 Fig 4.5 | EC_LM2, surfacing 0.1 m, slab 0.2 m | 1 m | 1 m | 0.00 | 0.01 |  |
| EC_LM2 dispersed length | `point_to_patch_dispersal` | EN 1991-2 §4.3.3 (0.60 × 0.35 m), §4.3.6 Fig 4.5 | EC_LM2, surfacing 0.1 m, slab 0.2 m | 0.75 m | 0.75 m | 0.00 | 0.01 |  |
| EC_LM2 pressure (load kept) | `point_to_patch_dispersal` | EN 1991-2 §4.3.3 (0.60 × 0.35 m), §4.3.6 Fig 4.5 | EC_LM2, 200 kN | 266.67 kN/m² | 266.67 kN/m² | 0.00 | 0.01 |  |

### Concrete

| Check | Tool | Source | Inputs | Expected | Tool output | Diff % | Tol. % | Note |
|---|---|---|---|---|---|---|---|---|
| neutral axis x, h 250, C30, α_cc 1, H16@150 | `slab_capacities_from_bars` | EN 1992-1-1 §3.1.7(3), §6.1 (λ 0.8, η 1, γc 1.5, γs 1.15) | h 250, C30, α_cc 1, H16@150 | 36.424 mm | 36.424 mm | 0.00 | 0.1 |  |
| M_Rd, h 250, C30, α_cc 1, H16@150 | `slab_capacities_from_bars` | EN 1992-1-1 §3.1.7(3), §6.1 | h 250, C30, α_cc 1, H16@150 | 115.06 kNm/m | 115.06 kNm/m | 0.00 | 0.1 |  |
| neutral axis x, h 250, C30, α_cc 1, H12@200 | `slab_capacities_from_bars` | EN 1992-1-1 §3.1.7(3), §6.1 (λ 0.8, η 1, γc 1.5, γs 1.15) | h 250, C30, α_cc 1, H12@200 | 15.366 mm | 15.366 mm | 0.00 | 0.1 |  |
| M_Rd, h 250, C30, α_cc 1, H12@200 | `slab_capacities_from_bars` | EN 1992-1-1 §3.1.7(3), §6.1 | h 250, C30, α_cc 1, H12@200 | 47.17 kNm/m | 47.17 kNm/m | 0.00 | 0.1 |  |
| neutral axis x, h 300, C40, α_cc 0.85, H20@125 | `slab_capacities_from_bars` | EN 1992-1-1 §3.1.7(3), §6.1 (λ 0.8, η 1, γc 1.5, γs 1.15) | h 300, C40, α_cc 0.85, H20@125 | 60.261 mm | 60.261 mm | 0.00 | 0.1 |  |
| M_Rd, h 300, C40, α_cc 0.85, H20@125 | `slab_capacities_from_bars` | EN 1992-1-1 §3.1.7(3), §6.1 | h 300, C40, α_cc 0.85, H20@125 | 246.84 kNm/m | 246.84 kNm/m | 0.00 | 0.1 |  |
| neutral axis x, h 300, C40, α_cc 0.85, H16@200 | `slab_capacities_from_bars` | EN 1992-1-1 §3.1.7(3), §6.1 (λ 0.8, η 1, γc 1.5, γs 1.15) | h 300, C40, α_cc 0.85, H16@200 | 24.104 mm | 24.104 mm | 0.00 | 0.1 |  |
| M_Rd, h 300, C40, α_cc 0.85, H16@200 | `slab_capacities_from_bars` | EN 1992-1-1 §3.1.7(3), §6.1 | h 300, C40, α_cc 0.85, H16@200 | 97.191 kNm/m | 97.191 kNm/m | 0.00 | 0.1 |  |

### Sections

| Check | Tool | Source | Inputs | Expected | Tool output | Diff % | Tol. % | Note |
|---|---|---|---|---|---|---|---|---|
| rectangle area | `section_properties` | closed form | rectangle 500 × 300 mm | 150000 mm² | 150000 mm² | 0.00 | 0.01 |  |
| rectangle I (strong) | `section_properties` | closed form bh³/12 | rectangle 500 × 300 mm | 1.1250e9 mm⁴ | 1.1250e9 mm⁴ | 0.00 | 0.01 |  |
| rectangle I (weak) | `section_properties` | closed form hb³/12 | rectangle 500 × 300 mm | 3.1250e9 mm⁴ | 3.1250e9 mm⁴ | 0.00 | 0.01 |  |
| rectangle torsion constant J | `section_properties` | Saint-Venant torsion series (Timoshenko & Goodier) | rectangle 500 × 300 mm | 2.8163e9 mm⁴ | 2.8163e9 mm⁴ | 0.00 | 0.2 | FE mesh |
| T-section area | `section_properties` | closed form (parallel axes) | T 1000×200 flange, 200×800 web | 360000 mm² | 360000 mm² | 0.00 | 0.01 |  |
| T-section I (strong) | `section_properties` | closed form (parallel axes) | T 1000×200 flange, 200×800 web | 3.1422e10 mm⁴ | 3.1422e10 mm⁴ | 0.00 | 0.01 |  |
| T-section I (weak) | `section_properties` | closed form | T 1000×200 flange, 200×800 web | 1.7200e10 mm⁴ | 1.7200e10 mm⁴ | 0.00 | 0.01 |  |
| tube torsion constant J | `section_properties` | closed form π(R⁴ − r⁴)/2 | tube R 0.5 / r 0.4 m | 0.057962 m⁴ | 0.057622 m⁴ | −0.59 | 1 | circles drawn as 48-gons |

### Earth pressure

| Check | Tool | Source | Inputs | Expected | Tool output | Diff % | Tol. % | Note |
|---|---|---|---|---|---|---|---|---|
| d_k = α L_x (T_e,max − T_e,min) | `pd6694_route_a` | PD 6694-1:2011+A1:2020 cl 9.4.2 | L_x = 30 m, ΔT 39 °C, α 12×10⁻⁶ | 0.01404 m | 0.01404 m | 0.00 | 0.01 |  |
| d_d = ½ d_k (1 + ψ γ_Q) | `pd6694_route_a` | PD 6694-1 cl 9.4.2 | ψ 1, γ_Q 1.5 | 0.01755 m | 0.01755 m | 0.00 | 0.01 |  |
| K0 | `pd6694_route_a` | K0 = 1 − sin φ' (Jaky) | φ'peak 35° | 0.42642 | 0.42642 | 0.00 | 0.01 |  |
| K*_d = K0 + (C d'_d/H)^0.6 K_p;t | `pd6694_route_a` | PD 6694-1 cl 9.4.3 (C = 20, exponent 0.6) | H = 6 m, the tool's K0 and K_p;t | 1.4969 | 1.497 | +0.01 | 0.1 | checks the equation; K_p;t itself is the next row |
| K_p;t | `pd6694_route_a` | PD 6694-1 cl 9.4.1, Table 7 | φ' 35°, vertical face | 5.88 | 5.8788 | −0.02 | 0.1 | Table 7 is printed to 2 decimals; the engine's Annex C log spiral gives 5.879 |

## Differences explained

- **Rounding in the worked example.** The JRC text rounds as it goes. It takes d_tot = 4.00 m for the 3.9375 m it calculates, takes c_r(10) ≈ 1.0 instead of 1.0067 when it tabulates q_p(10), and rounds v_m from 17.78 to 18 m/s in the construction case. The expected values above use the example's own inputs and equations without those roundings; the notes give the difference from the printed figure (−1.5 %, +1.4 % and −2.6 %).
- **Wind with traffic.** The JRC example gives the characteristic force on v_b,0 = 26 m/s and then applies ψ0. The tool writes the with-traffic case as F_W* on v_b,0* = 23 m/s, the recommended value of EN 1991-1-4 §8.1(4). The check uses that equation. Scaled back by (26/23)², the tool's 10.66 kN/m becomes 13.62 kN/m, against 13.64 kN/m in the example.
- **c_fx,0.** The tool does not read Figure 8.3 for you; it uses the §8.3.1 NOTE 2 value 1.3 unless you enter one, and warns when b/d_tot is below 4. The checks enter the example's values (1.55, 1.83, 1.9).

## Not yet verified

These have no independent check in this pack yet. They are covered only by the plugins' own tests and, where noted, by runs in CIVIL NX.

- **Wind:** CS 454 Appendix D (the `cs454` inputs of `ec_wind_bridge`); the UK and Irish National Annexes; Figure 8.3 itself (not transcribed: the engineer enters c_fx,0).
- **Thermal:** the non-linear temperature differences (approach 2, Figures 6.2a–c); the UK National Annex values; CS 454 and BS 5400-2 thermal; bearing and joint ranges; the simultaneity combinations beyond their factors.
- **Traffic:** vehicle definitions, load cases and envelopes written by `ec_moving_loads` and `cs454_moving_loads`; combination factors written by the combination tools.
- **PD 6694:** the pressure distributions with depth (the two-part K* diagram), the force and moment per metre, and the soil-structure interaction route (Annex A).
- **Concrete:** RC slab assessment beyond the stress-block capacities (Wood–Armer/Denton moments and Annex LL); the EN 1992 section checks (`ec2_*`) and CS 455 assessments, which need a model.
- **Model-dependent tools:** Tendon Designer, stress profiles and SLS stress checks, concurrent forces and reactions, combination contributions, culvert analysis, model health checks, reports and exports. They need an open model and its results. Their tests run against the plugins' own fixtures and a simulated CIVIL NX; some were also run on test models in CIVIL NX before release, and some were not. Neither kind of test can be re-run here without a licence and a model.
- **Write tools:** what is written to the model is tested against a simulated CIVIL NX (and, for some plugins, in CIVIL NX before release), not against published examples.

To add a check, add a row to `verification/verify.test.mjs` with its source and the expected value worked out from that source, then regenerate the tables on this page.
