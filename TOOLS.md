# Tools

93 tools from 28 MIDAS IT Europe plugins. Generated from the live catalogue; the full descriptions and every input are on [midasiteurope.com/llm](https://midasiteurope.com/llm#tools), and your assistant reads them from the server itself.

Lists captured before server 0.8.0 show 108 tools. Since 0.8.0, one `undo_run` replaces the 17 per-plugin undo tools, and `model_health_check` covers `model_qc_check`. Those 18 names are no longer listed but still run when called by name, so there are 111 callable names in all.

- **Calculation**: needs no model and no account.
- **Read-only**: reads the open model, never changes it.
- **Changes model**: previews first, applies only after you agree, and has a matching undo.
- **Background**: on the website the call returns a job at once and the assistant follows it with `job_status`. *When applied* means only the apply runs that way.

## Model and connection

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `midas_docs_search` | Searches the MIDAS help centre (support.midasuser.com), live: the CIVIL NX and GEN NX online help (every dialog: what it does, where it is in the menus, each input), the MIDAS API (MAPI) JSON manual… | Use for how-to questions, what a CIVIL NX input means, or a MIDAS API table's fields. For valid names (material grades, section shapes) use midas_library. | Calculation |  |
| `midas_docs_read` | Reads one MIDAS help-centre article in full, as Markdown: headings, notes, input tables, and for the MIDAS API manual the URI, methods, JSON schema and JSON examples as code blocks. | Use after midas_docs_search, to read one article in full. | Calculation |  |
| `midas_library` | Structured reference for writing a CIVIL NX model through the API (civil_write_tables): the material standard names CIVIL NX knows (46 concrete standards), material fields per type, grades known to… | Use for valid names when writing tables: material standards and grades, section shapes and their dimension order, element and support rows. For how-to text and API fields use midas_docs_search. | Calculation |  |
| `civil_status` | Checks the MAPI connection to CIVIL NX and summarises the open model: units, moving load code, row counts per table, structure/boundary/load group names, static load cases, stages, general… | Start here: checks the connection and summarises the open model. For one table's rows use civil_read_table. | Read-only |  |
| `civil_read_table` | Reads one MIDAS database table (GET /db/&lt;TABLE&gt;) from the open model, e.g. NODE, ELEM, SECT, GRUP, STLD, STAG, LLAN, MVLDBS, LCOM-GEN. | Use for the raw rows of one model-input table. For analysis results use preview_result_table; for a model overview use civil_status. | Read-only |  |
| `job_status` | Status, progress and (when finished) the result of a tool call that returned a jobId. | Use only with a jobId that another tool returned. | No model |  |
| `civil_loads_supports` | The fast way to add supports, point springs, beam end releases, self-weight, nodal loads, beam UDLs, plate pressures and element temperatures: describe WHERE (structure group, id ranges, a line, a… | Use for any support, spring, release, self-weight, nodal load, UDL, pressure or temperature you can state directly. For code-derived loads use ec_wind_apply, bridge_thermal_apply, ec_moving_loads or cs454_moving_loads. | Changes model | Background when applied |
| `civil_combinations_quick` | Writes general load combinations from plain factors, e.g. { name: "ULS1", factors: { "SW": 1.35, "SDL": 1.35, "LM1": 1.5 } } — for hand-picked combinations; for the full code set use… | Use for a few hand-picked combinations. | Changes model | Background when applied |
| `civil_remove_loads` | Takes loads out of the model without touching other load cases: CIVIL NX keeps every case's beam loads, nodal loads, pressures and temperatures of an element or node in ONE row, so a plain delete… | Use to take out loads, supports or load cases you name. To reverse a plugin run use that plugin's undo; for wind or thermal cases use ec_wind_remove or bridge_thermal_remove. | Changes model | Background when applied |
| `civil_write_tables` | Creates, changes or deletes rows in any CIVIL NX database table through the MIDAS API — nodes, elements, materials, sections, thicknesses, supports, links, load cases, loads, groups, stages… | Use for a model change no other tool makes (e.g. building from scratch). Prefer civil_loads_supports for loads and supports, civil_combinations_quick for combinations, and a plugin tool where one fits. | Changes model | Background when applied |
| `civil_run_analysis` | Runs the CIVIL NX analysis of the open model (doc/ANAL), so results can be read with the result tools straight after building or changing a model. | Use to run the analysis of any model. For culverts use culvert_analyse_and_check; for PD 6694 SSI use pd6694_ssi_run. | Changes model | Background when applied |
| `civil_save_model` | Saves the open CIVIL NX model: over its own file (doc/SAVE), or as a new .mcb file when path is given (doc/SAVEAS; a file of that name is overwritten). | Use to save the open model, or save it under a new path. | Changes model | Background when applied |
| `undo_run` | Reverses one change a tool made to the model, from the record every apply leaves. | Use to reverse any change a tool made to the model (list the recorded runs, preview, then apply). For wind or PD 6694 loads use ec_wind_remove / pd6694_route_a_remove / pd6694_ssi_remove; to take out loads or supports added by hand use civil_remove_loads. | Changes model | Background when applied |

## Model Report

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `analysis_diagnose` | Finds why a CIVIL NX analysis stopped or warned ("DOF may be singular", "error norm is infinite / NaN", "displacement abnormal", "has not satisfied convergence tolerance", "beam section temperature… | Use when the analysis stops or warns ("DOF may be singular", "error norm is infinite / NaN", convergence not reached, run-time errors): pass the message text. It names the nodes and stages with free DOFs, the cause and the fix. For a general review of the model use model_health_check. | Read-only | Background |
| `model_health_check` | One read-only check of the open CIVIL NX model for anything that is likely wrong, grouped into areas with a red/amber/green status each. | Use for "is anything wrong with my model?". This is the full check: the Model Report's fourteen QC checks plus units, tendons, stages, moving loads and results. For a design check of a section use ec2_section_check or cs455_assess. | Read-only | Background |
| `model_report_images` | Lists the CIVIL NX pictures the Model Report can put in this model's report, with their keys: FE model views (iso, plan, front, side), the applied loads of each static load case, the figures saved in… | Use before model_report_export, to pick the pictures for the report. | Read-only | Background |
| `model_report_export` | Builds the Model Report plugin's 'Model report' for the open CIVIL NX model — cover, contents, materials, sections (with drawings), supports and springs, load cases, combinations and loads… | Use for the whole-model report document. For construction stages use cs_stage_report; for a design calculation sheet use ec2_export_calc_sheet or cs455_export_calc_sheet; for raw tables use export_result_tables. | Read-only | Background |

## Auto Structure Groups

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `auto_structure_groups` | Creates one structure group per section, per material, or per section + material pair, with the Auto Structure Groups plugin's own engine: it reads every element's section and material, names each… | Use to group elements automatically by section, material or both. For groups by position or by construction-stage segment use stage_groups; for one group of ids you already know use civil_write_tables (GRUP). | Changes model | Background when applied |

## Beam to Plate

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `b2p_survey` | Reads the model the way the Beam to Plate plugin (1.0.6) does and studies every section the chosen beams use, against CIVIL NX's own published properties (/ope/SECTPROP): whether the outline was READ… | Use before b2p_convert, to see which beams and sections can become a plate or solid mesh. To read a section's shape use section_read; for bar placement in a design check use ec2_describe_section or cs455_describe_section. | Read-only | Background |
| `b2p_convert` | Converts beam elements into a plate (or solid) mesh of their cross-section with the Beam to Plate plugin's own engine (1.0.6): every section CIVIL NX gives geometry for (rolled/fabricated steel, PSC… | Use to replace beam elements with a plate or solid mesh of their real cross-section (a detailed local model). Not for building a new deck (skew_grillage) or changing spans (bridge_reshape). | Changes model | Background |

## Bridge Reshaper

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `bridge_reshape_read` | Reads the open model the way the Bridge Reshaper plugin (1.0.6) does: the deck (straight, in straight pieces kinked at half-joints or piers, or curved; beam girders, girders meshed as plates, or a… | Use before bridge_reshape, to see the existing bridge's spans, skews, alignment and levels. Read-only. | Read-only | Background |
| `bridge_reshape` | Changes the geometry of the bridge in the open model in place, with the Bridge Reshaper plugin's own engine (1.0.6): new span lengths (the deck is stretched - each span keeps its element count), a… | Use to change the spans, support skews, alignment or deck levels of a bridge that is already in the model. For a new deck use skew_grillage; for geometry from a drawing use dxf_import. | Changes model | Background |

## Bridge Thermal Loads

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `bridge_thermal_calc` | Calculates bridge temperature actions with the Bridge Thermal Loads plugin's own engine: shade air and effective bridge temperatures, the uniform ranges ΔT_N,con / ΔT_N,exp (and bearing ranges), the… | Use for code temperature values of a bridge (EN 1991-1-5, CS 454, BS 5400-2) without touching the model. To write them use bridge_thermal_apply; for a temperature you already know use civil_loads_supports (temperature). | Calculation |  |
| `bridge_thermal_read` | Reads the open model the way the Bridge Thermal Loads plugin does: the deck from a structure group, element list or the CIVIL NX selection, grouped into sections (beams by section, plates by… | Use before bridge_thermal_apply, to find the deck and its sections. Read-only. | Read-only | Background |
| `bridge_thermal_apply` | Calculates the temperature actions for the deck and writes them with the Bridge Thermal Loads plugin's writer: EC1T_Uniform_Exp/_Con (type T, element or system temperature), EC1T_Diff_Heat/_Cool… | Use to write code-derived bridge temperature load cases (EC1T_…) on the deck. For a single temperature value you already have, civil_loads_supports (temperature) is simpler. | Changes model | Background |
| `bridge_thermal_remove` | Removes what the Bridge Thermal Loads plugin writes: every load case whose name starts with EC1T_ (also named sets and ones the plugin window wrote) and all temperature loads in them, on any element. | Use to delete every EC1T_ thermal load case, whichever run or window wrote it. To reverse one run only use bridge_thermal_undo; for other loads use civil_remove_loads. | Changes model | Background when applied |

## Concurrent Force Reporter

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `concurrent_forces_setup` | Concurrent Force Reporter, step 1. Reads the open CIVIL NX model the way the plugin does when it connects and lists what a concurrent-forces run can use: every load case and combination (all ten LCOM… | Concurrent forces, step 1: use before concurrent_forces to list the items, effects and load states the model offers. Read-only. | Read-only | Background |
| `concurrent_forces` | Concurrent Force Reporter, step 2. For a set of items (elements, nodes, links), finds the load state that makes ONE key effect extreme at ONE key item (max, min or absolute max over the selected load… | Use for the forces that act together with the extreme of ONE effect (e.g. My max with its concurrent N and Vz). For which load cases make up a combination use combination_contributions; for plain result rows use preview_result_table. | Read-only | Background |
| `concurrent_forces_probe` | Concurrent Force Reporter diagnostics. For each result source the plugin reads (beam, truss, plate, general link, elastic link, node reaction, node displacement), asks this CIVIL NX build with one… | Use only to diagnose why concurrent_forces finds no results for a source; not a result reader. | Read-only | Background |

## CS 454 - Moving Load Wizard

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `cs454_lane_layout` | Lays out CS 454 notional lanes, remaining areas, footways and strips on a carriageway cross-section with the CS454 - Moving Load Wizard's own layout engine (Table 5.9a, cl 5.10, ALL model 1… | Use to lay out CS 454 notional lanes on a carriageway width, with no model. For EN 1991-2 lanes use ec_lane_layout; to write lanes and vehicles use cs454_moving_loads. | Calculation |  |
| `cs454_moving_loads_read` | Read-only: changes nothing in the model. Call it before cs454_moving_loads to see what the CS454 - Moving Load Wizard would do. | Use before cs454_moving_loads. For Eurocode traffic use ec_moving_loads_read. | Read-only | Background |
| `cs454_moving_loads` | CS 454 assessment live loading with the CS454 - Moving Load Wizard plugin's own engine: notional lanes laid out on the carriageway (line lanes on a grillage, surface lanes on a plate deck), ALL model… | Use for UK CS 454 assessment live loading (lanes, vehicles, moving-load cases). For EN 1991-2 traffic use ec_moving_loads; to spread existing point loads into patches use point_to_patch_apply. | Changes model | Background when applied |

## CS 454 Load Assessment Combinations

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `cs454_combinations_read` | Reads the open model the way the CS 454 Load Assessment Combinations plugin does: every static, construction-stage, settlement and moving load case with the Table A.1 action / CS 454 load model and… | Use before cs454_combinations_apply. For Eurocode use ec_combinations_read; to list or explore the combinations already in the model use combination_tree. | Read-only |  |
| `cs454_combinations_apply` | Generates CS 454 assessment load combinations with the plugin's engine (Table A.1 γfL by combination 1–4 and limit state, adverse/relieving permanent variants, wind sub-case, ALL/SV/HB traffic with… | Use for the full CS 454 (UK assessment) combination set. For EN 1990 use ec_combinations_apply; for a few hand-picked combinations use civil_combinations_quick. | Changes model | Background |

## CS 455 RC + PSC Assessment

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `cs455_describe_section` | Start here when the user shares a reinforcement drawing, photo or schedule. | Step 1 of a CS 455 (UK assessment) concrete section check. For a Eurocode check use ec2_describe_section; only to read or edit a section's shape use section_read. | Read-only |  |
| `cs455_assess` | CS 455 ULS assessment of reinforced concrete beam sections with the plugin's own engine: reads the concurrent force rows (BEAMFORCE / BEAMFORCEVBM for envelopes and moving loads, kN·m; a moving-load… | Use for CS 455 (UK assessment) ULS of RC beam, column, pier or pile sections. For EN 1992 use ec2_section_check; for slabs and plates use slab_assess; for stresses use stress_profile or sls_stress_check. | Read-only | Background |
| `cs455_export_calc_sheet` | The report. Assesses one element end exactly as cs455_assess and writes the plugin's reference-format calculation sheet (.xlsx: A4 pages, title block, geometry, materials, reinforcement, section… | Use for the CS 455 Excel calculation sheet of one element end. For EN 1992 use ec2_export_calc_sheet. | Read-only | Background |

## Construction Stage Reporter

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `cs_stage_summary` | Reads the construction stage definition of the open CIVIL NX model with the Construction Stage Reporter plugin's engine and returns, per stage: duration and day range, the structure groups activated… | Use to list the construction stages already in the model (durations, groups activated). To create stages use construction_stages; for stage results use cs_stage_results. | Read-only |  |
| `cs_stage_results` | Reads construction-stage analysis results the way the Construction Stage Reporter plugin does (POST /post/TABLE in the construction-stage family, every stage in one query at its last step; stages… | Use for construction-stage analysis results, stage by stage. For results that are not per stage use preview_result_table; for the Excel / PDF report use cs_stage_report. | Read-only | Background |
| `cs_stage_report` | Makes the Construction Stage Reporter plugin's own reports of the open model's construction stages and returns download links (never the file inline): the Excel workbook (summary, stage matrices for… | Use for the construction-stage report (Excel, PDF, video). For the whole-model report use model_report_export. | Read-only | Background |

## 2D Culvert

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `culvert_preview` | Validates a 2D Culvert project with the plugin's own Eurocode core and returns what it would build: nodes, elements, soil springs, basic load cases (traffic unit cases), the EN 1990 Annex A2… | Step 1 of a 2D box culvert built from inputs (Eurocode). Not for bridge decks (skew_grillage). | Calculation |  |
| `culvert_build` | Writes the 2D Culvert model exactly as the plugin's Build: units, user material, sections, frame, soil springs, supports, every basic load case with its loads, and the nested EN 1990 Annex A2… | Use to write the 2D culvert model after culvert_preview. Only for culverts. | Changes model | Background when applied |
| `culvert_analyse_and_check` | On the culvert model built from the same inputs (refused if the open model's counts differ): runs the CIVIL NX analysis (unless analyse: false), reads the basic-case results (forces, reactions… | Use only on a culvert made by culvert_build. To analyse any other model use civil_run_analysis. | Changes model | Background |
| `culvert_report` | Runs the checks on the analysed culvert model (as culvert_analyse_and_check, without re-analysing unless analyse: true) and writes the plugin's report: format xlsx (default) = the calculation book in… | Use for the culvert calculation report. For a general model report use model_report_export. | Read-only | Background |

## Advanced DXF Importer

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `dxf_inspect` | Reads a DXF with the Advanced DXF Importer plugin's own parser and clean-up and reports what an import would create: the file (version, encoding, entity counts, what is ignored or unsupported), its… | Use before dxf_import, to see what a DXF would create. No model needed. | Calculation |  |
| `dxf_import` | Imports a DXF into the open CIVIL NX model with the Advanced DXF Importer plugin's engine: the same parse, layer mapping, clean-up and write as the plugin. | Use to bring geometry from a DXF drawing into the model. For a deck from parameters use skew_grillage; for nodes from a coordinate list use create_nodes. To export a DXF use model_to_dxf. | Changes model | Background when applied |

## Eurocode Load Combinations

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `ec_combinations_read` | Reads the open model the way the Eurocode Load Combinations plugin does: every static, moving (characteristic/frequent pairs), construction-stage, settlement and response-spectrum case with the… | Use before ec_combinations_apply. For CS 454 use cs454_combinations_read; to list or explore the combinations already in the model use combination_tree. | Read-only |  |
| `ec_combinations_apply` | Generates EN 1990 bridge load combinations with the Eurocode Load Combinations plugin's engine (6.10 / 6.10a+b, SLS characteristic / frequent / quasi-permanent, accidental 6.11, seismic 6.12; Annex… | Use for the full EN 1990 bridge combination set. For CS 454 use cs454_combinations_apply; for a few hand-picked combinations use civil_combinations_quick. | Changes model | Background |

## Eurocode - Moving Load Wizard

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `ec_lane_layout` | Lays out EN 1991-2 lanes on a carriageway cross-section with the Eurocode - Moving Load Wizard's own layout engine: Table 4.1 notional lanes and the remaining area, footways, the LM2 axle lane, the… | Use to lay out EN 1991-2 notional lanes on a carriageway width, with no model. For CS 454 lanes use cs454_lane_layout; to write lanes and vehicles use ec_moving_loads. | Calculation |  |
| `ec_moving_loads_read` | Read-only: changes nothing in the model. Call it before ec_moving_loads to see what the Eurocode - Moving Load Wizard would do. | Use before ec_moving_loads. For CS 454 traffic use cs454_moving_loads_read. | Read-only | Background |
| `ec_moving_loads` | EN 1991-2 traffic loading with the Eurocode - Moving Load Wizard plugin's own engine: lanes laid out on the carriageway (line lanes on a grillage, surface lanes on a plate deck) for the chosen load… | Use for EN 1991-2 traffic loading (lanes, vehicles, moving-load cases). For UK CS 454 assessment use cs454_moving_loads; to spread existing point loads into patches use point_to_patch_apply. | Changes model | Background when applied |

## Wind Load Calculator

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `ec_wind_bridge` | Calculates wind on a bridge deck with the Wind Load Calculator plugin's own engine (formerly Eurocode Wind Loads). code EN: EN 1991-1-4 §8 — v_b, q_p(z_e), c_sc_d, d_tot, the transverse (x)… | Use for bridge deck wind values (EN 1991-1-4 or CS 454) without touching the model. To write them use ec_wind_apply; for the Excel hand calculation use ec_wind_export_calc_sheet. | Calculation |  |
| `ec_wind_export_calc_sheet` | Writes the Wind Load Calculator plugin's Excel hand calculation for a bridge deck — the same workbook as the window's Export Excel — and returns a download link. code EN: EN 1991-1-4 §8 sheet… | Use for the wind hand calculation as an Excel workbook (EN 1991-1-4 or CS 454) for a checker. For the numbers alone use ec_wind_bridge; to write the loads use ec_wind_apply. | Calculation |  |
| `ec_wind_read_deck` | Reads the open model the way the Wind Load Calculator plugin does: finds the deck (or measures the elements / group given), and reports b, d, L, the soffit height, the span axis, whether the deck is… | Use before ec_wind_apply, to find the deck and its dimensions. Read-only. | Read-only |  |
| `ec_wind_apply` | Calculates wind on the deck (EN 1991-1-4 §8, or CS 454 Appendix D with code: CS454) and writes it with the Wind Load Calculator plugin's adapter: one load case per global direction (EC1W_ for EN… | Use to write code-derived wind load cases on the deck. For a wind load you already know, civil_loads_supports is simpler. | Changes model | Background when applied |
| `ec_wind_remove` | Removes what the Wind Load Calculator plugin writes: every EC1W_ and C454W_ load case, its load group, and their beam/pressure/nodal loads — whether this tool or the plugin window wrote them. | Use to delete the wind load cases the Wind Load Calculator wrote (EC1W_, C454W_); it is also the undo of ec_wind_apply. For other loads use civil_remove_loads. | Changes model | Background when applied |

## Skew Grillage Geometry Generator

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `skew_grillage` | Generates a bridge deck (beam grillage or plate mesh) with the Skew Grillage Geometry Generator plugin's own engine: skew (0 = straight/square), unequal girders, plan curvature, multi-span, crossfall… | Use to create a new bridge deck (beam grillage or plate mesh) from spans, widths and skew. To change a deck already in the model use bridge_reshape; for geometry from a drawing use dxf_import. | Changes model | Background when applied |

## Load Combination Contribution Analyzer

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `combination_tree` | Load Combination Contribution Analyzer, step 1. Without name: lists the model's General-tab load combinations (LCOM-GEN) with type (ADD, ENVELOPE, ABS, SRSS), constituent count, whether it is a… | Use to list the model's combinations, or show one's tree of cases and factors. Read-only. To split a result into its load cases use combination_contributions; to write combinations use civil_combinations_quick or the code tools. | Read-only | Background |
| `combination_contributions` | Load Combination Contribution Analyzer, step 2. Splits one or more load combinations' results at a set of items into the load cases that produced them: for every item, output point (beam I/J and… | Use to find which load cases make up a combination's result at given items. For the forces that act together with an extreme use concurrent_forces. | Read-only | Background |

## Model to IFC

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `model_bridge_summary` | Reads the open model's geometry tables and CIVIL NX's computed section properties and reports the bridge the Model to IFC plugin finds in it: girder lines, piers and pylons (station, elements… | Use before model_to_ifc or model_to_dxf, to see what the exporter finds. For a general model summary use civil_status. | Read-only |  |
| `model_to_ifc` | Exports the open CIVIL NX model to IFC with the Model to IFC plugin: real section outlines with voids, smooth tapers, tendons, composite deck slabs, materials, structure groups and stages; in IFC4.3… | Use to export the model to IFC (BIM). For 2D drawings use model_to_dxf. | Read-only | Background |
| `model_to_dxf` | Draws the open CIVIL NX model as DXF with the Model to IFC plugin's drawing engine: a 2D drawing file (DXF 2000: plan, elevation developed along the deck, hidden-line isometric, section cuts with… | Use to export the model as DXF drawings. To import a DXF use dxf_import. | Read-only | Background |

## Node Generator

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `create_nodes` | Creates nodes in the open CIVIL NX model from X, Y, Z coordinates with the Node Generator plugin's own engine: every check the plugin window makes (blank or non-numeric coordinates, bad or duplicate… | Use to create many nodes from coordinates, with the plugin's checks. For nodes plus elements use civil_write_tables; for a whole deck use skew_grillage. | Changes model | Background when applied |

## PD 6694-1 Integral Abutment

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `pd6694_route_a` | PD 6694-1 integral abutment earth pressures by the limit-equilibrium route (K*, cl.9.4.3/9.4.4) with the PD 6694-1 Integral Abutment plugin's own engine: thermal movement and design displacement, the… | Use for PD 6694-1 integral abutment earth pressures by the limit-equilibrium route, with no model. For the soil-structure interaction route use pd6694_ssi_plan. | Calculation |  |
| `pd6694_route_a_write` | Writes the four PD 6694 limit-equilibrium states as plate pressures on one or two abutment wall groups, exactly as the plugin's Write button: same-model guard, the PD6694 EP load cases and groups… | Use after pd6694_route_a, to write its pressures on the abutment walls. | Changes model | Background when applied |
| `pd6694_route_a_remove` | Removes the four PD6694 EP limit-equilibrium load cases with their pressures, load groups and stage activations (the plugin's Remove). | Use to remove the Route A cases; it is also the undo of pd6694_route_a_write. For SSI results use pd6694_ssi_remove. | Changes model | Background when applied |
| `pd6694_ssi_plan` | Read-only: changes nothing in the model. Call it before pd6694_ssi_run, with the same inputs, to check that the PD 6694-1 Annex A soil-structure interaction run can go ahead — it uses the plugin's… | Step 1 of a PD 6694 Annex A (SSI) run. For the limit-equilibrium route use pd6694_route_a. | Read-only |  |
| `pd6694_ssi_run` | Runs the PD 6694-1 Annex A iteration with the plugin's own runner: Winkler springs on the walls (multi-linear), repeated analyses until the wall displacements settle, then the two design pressure… | Use only for the PD 6694 Annex A iteration. For a normal analysis use civil_run_analysis. | Changes model | Background when applied |
| `pd6694_ssi_remove` | Removes everything an SSI run left (design pressure cases, spring groups, analysis cases) and restores the model's own springs from the run's backup (the plugin's Remove SSI). | Use to remove what pd6694_ssi_run left; it is also its undo. For Route A cases use pd6694_route_a_remove. | Changes model | Background when applied |

## Point to Patch Convertor

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `point_to_patch_dispersal` | The Point to Patch Convertor's dispersal for one point load: the code's contact area (or the load-derived one), the spread through surfacing and slab to the mid-plane or neutral axis, the effective… | Use for one wheel or point load's dispersal patch, with no model. To convert the model's loads use point_to_patch_apply. | Calculation |  |
| `point_to_patch_read` | Reads the open model as the Point to Patch Convertor does: whether the deck is plates or a grillage, its levels and groups, the point loads (nodal and beam concentrated) per load case that could be… | Use before point_to_patch_apply. Read-only. | Read-only | Background |
| `point_to_patch_apply` | Converts the model's point loads (or a coordinate table) into dispersed patch loads with the Point to Patch Convertor's engine and writes them as PATCH_&lt;case&gt; load cases: plate decks get… | Use to turn the model's point loads into dispersed patch loads. For new traffic use ec_moving_loads or cs454_moving_loads; for new point loads use civil_loads_supports. | Changes model | Background |

## RC Slab & Shell Assessment

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `slab_capacities_from_bars` | Calculation only: needs no model and changes nothing. Turns a slab's bar arrangement into the capacities the RC Slab & Shell Assessment routes need, with the plugin's own core. | Use to turn a slab's bar arrangement into capacities for slab_assess, with no model. For beam sections use ec2_describe_section or cs455_describe_section. | Calculation |  |
| `slab_survey` | Reads the open model's plates (ELEM/NODE), structure groups, static cases and combinations (all LCOM tables) the way the RC Slab & Shell Assessment plugin does: orientation groups by plate normal… | Use before slab_assess, to list plates, groups and load cases. Read-only. | Read-only |  |
| `slab_assess` | Reads plate forces (PLATEFORCEUL, element local axes) for one orientation group and the given load cases, rotates them to the reinforcement direction and assesses every position with the plugin's own… | Use for RC slabs and shells from plate forces. For beam, column or pier sections use ec2_section_check or cs455_assess. | Read-only | Background |
| `slab_explain_location` | The working behind one element's utilisation: reads that element's plate forces, picks its governing position and case (or the one given) and re-runs it through the plugin's explain_location — every… | Use after slab_assess, to explain one element's utilisation. | Read-only |  |

## Bulk Tabular Result Exporter

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `result_table_catalog` | Lists the CIVIL NX tables the Bulk Tabular Result Exporter plugin can export, with each one's id, MIDAS TABLE_TYPE or /db endpoint, components and the arguments it takes: analysis results (reactions… | Use to find a result table's id before preview_result_table or export_result_tables. For model-input tables use civil_read_table. | Calculation |  |
| `preview_result_table` | Reads one table from the open CIVIL NX model the way the exporter's 'Preview this table' does and returns its first rows (default 20, max 200) with unit-labelled headers, any sub-tables (e.g.… | Use to look at analysis results (or a model table) row by row. For construction-stage results use cs_stage_results; for input rows use civil_read_table; for Excel use export_result_tables. | Read-only |  |
| `export_result_tables` | Exports one or more CIVIL NX tables (each like the preview_result_table arguments, full scope, no sampling) into one Excel workbook built by the exporter plugin: one sheet per table (and per… | Use to export full result tables to Excel. To look at the first rows use preview_result_table. | Read-only | Background |

## Section Designer

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `section_preview` | Checks a cross-section's outlines with Section Designer's own rules (closed, not self-crossing, holes inside their outline, no overlaps, materials) and returns a PNG drawing of it — the outlines… | Step 1 for a new section from a sketch or outline. For a section already in the model use section_read; for a code check use ec2_describe_section or cs455_describe_section. | Calculation |  |
| `section_properties` | Computes the full CIVIL NX property set of a section with Section Designer's solver: exact area, centroid, second moments, extreme fibres and perimeters from the outlines, and torsion J and shear… | Use for a new section's computed properties before writing it. For an existing section's stored properties use section_read. | Calculation |  |
| `section_write` | Writes a section into the open CIVIL NX model exactly as Section Designer's Write button does: VALUE/GEN, PSC/VALU or COMPOSITE-GEN with its computed properties (CIVIL keeps them as sent), in the… | Use to write a designed section into the model, after section_preview. | Changes model | Background when applied |
| `section_read` | Without id: lists the model's sections (id, name, type, whether Section Designer stores it as outlines) and the next free id. | Use to list the model's sections, or get one's outline to edit. For a code check use ec2_describe_section or cs455_describe_section; for Beam to Plate use b2p_survey. | Read-only |  |

## Construction Stage Wizard

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `stage_groups` | Creates structure groups with the Construction Stage Wizard plugin's group builder: pick a scope of elements, split it by rules (slice along X/Y/Z into n segments or at cuts, by section, material… | Use to make structure groups by position (slices, segments) for staging. For groups by section or material use auto_structure_groups. | Changes model | Background when applied |
| `construction_stages` | Builds a construction stage sequence with the Construction Stage Wizard plugin's bulk generator and writes it with its stage planner (which keeps composite sections and construction-stage load… | Use to create a construction stage sequence. To read the stages already defined use cs_stage_summary. | Changes model | Background when applied |

## Stress Profile Generator

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `stress_element_loads` | Reads what the Stress Profile Generator can show for chosen beam elements: each element's section (type, outline verified, composite parts, tapered), material, length, the load cases / combinations /… | Use before stress_profile, to see what results each beam element has. Read-only. | Read-only |  |
| `stress_profile` | The Stress Profile Generator's profile for ONE beam element: from CIVIL NX's beam forces and the true section outline it calculates σx (or σx from N / My / Mz, τ from Vz / Vy, von Mises, principal… | Use for the stress distribution through ONE beam section. For SLS limits over many elements use sls_stress_check; for capacity checks use ec2_section_check or cs455_assess. | Read-only |  |
| `sls_stress_check` | The Stress Profile Generator's SLS report check (EN 1992-2 §7.2 concrete, EN 1993-2 §7.3 structural steel; normal stress σx at the fibres) over many elements × positions × combinations — or, with… | Use for SLS stress limits over many elements (EN 1992-2, EN 1993-2). For one element's profile use stress_profile; for ULS capacity use ec2_section_check. | Read-only | Background |

## Tendon Designer

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `tendon_design` | Designs the post- or pre-tensioning tendons of a concrete girder in the open model to EN 1992-1-1 with the Tendon Designer plugin's own engine, or reads the model's own tendons and checks them (mode… | Use to design, or check, the prestressing tendons of a concrete girder. It writes nothing: tendon_write does. | Read-only | Background |
| `tendon_write` | Writes a tendon_design result into the open model with the Tendon Designer plugin's writer: the strand material and tendon property (or one already in the model), every tendon profile (TDNA) and its… | Use after tendon_design, to write its tendons into the model. | Changes model | Background |

## Eurocode Section Checker

| Tool | What it does | When to use it | Effect | Runs |
|---|---|---|---|---|
| `ec2_describe_section` | Start here for an EN 1992 section check. Reads one beam section of the open model through the shared MIDAS section library (any CIVIL NX section family; composite deck slabs as separate regions… | Step 1 of an EN 1992 (Eurocode) concrete section check. For CS 455 use cs455_describe_section; only to read or edit a section's shape use section_read. | Read-only |  |
| `ec2_section_check` | EN 1992-1-1 / EN 1992-2 check of concrete beam, column, pier and pile sections with the Eurocode Section Checker plugin's own engine. | Use for EN 1992 checks of RC or prestressed beam, column, pier or pile sections. For CS 455 use cs455_assess; for slabs and plates use slab_assess; for a stress plot use stress_profile. | Read-only | Background |
| `ec2_export_calc_sheet` | The report. Runs the check exactly as ec2_section_check and writes the plugin's calculation sheet (.xlsx in the CS 455 reference format, EN 1992 content, live formulas): one sheet per section -… | Use for the EN 1992 Excel calculation sheet. For CS 455 use cs455_export_calc_sheet. | Read-only | Background |
