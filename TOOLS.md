# Tools

101 tools from 26 MIDAS IT Europe plugins. Generated from the live catalogue; the full descriptions and every input are on [midasiteurope.com/llm](https://midasiteurope.com/llm#tools), and your assistant reads them from the server itself.

- **Calculation**: needs no model and no account.
- **Read-only**: reads the open model, never changes it.
- **Changes model**: previews first, applies only after you agree, and has a matching undo.
- **Background**: on the website the call returns a job at once and the assistant follows it with `job_status`. *When applied* means only the apply runs that way.

## Model and connection

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `midas_docs_search` | Searches the MIDAS help centre (support.midasuser.com), live: the CIVIL NX and GEN NX online help (every dialog: what it does, where it is in the menus, each input), the MIDAS API (MAPI) JSON manual… | Calculation |  |
| `midas_docs_read` | Reads one MIDAS help-centre article in full, as Markdown: headings, notes, input tables, and for the MIDAS API manual the URI, methods, JSON schema and JSON examples as code blocks. | Calculation |  |
| `midas_library` | Structured reference for writing a CIVIL NX model through the API (civil_write_tables): the material standard names CIVIL NX knows (46 concrete standards), material fields per type, grades known to… | Calculation |  |
| `civil_status` | Checks the MAPI connection to CIVIL NX and summarises the open model: units, moving load code, row counts per table, structure/boundary/load group names, static load cases, stages, general… | Read-only |  |
| `civil_read_table` | Reads one MIDAS database table (GET /db/&lt;TABLE&gt;) from the open model, e.g. NODE, ELEM, SECT, GRUP, STLD, STAG, LLAN, MVLDBS, LCOM-GEN. | Read-only |  |
| `job_status` | Status, progress and (when finished) the result of a tool call that returned a jobId. | No model |  |
| `civil_loads_supports` | The fast way to add supports, point springs, beam end releases, self-weight, nodal loads, beam UDLs, plate pressures and element temperatures: describe WHERE (structure group, id ranges, a line, a… | Changes model | Background when applied |
| `civil_combinations_quick` | Writes general load combinations from plain factors, e.g. { name: "ULS1", factors: { "SW": 1.35, "SDL": 1.35, "LM1": 1.5 } } — for hand-picked combinations; for the full code set use… | Changes model | Background when applied |
| `civil_remove_loads` | Takes loads out of the model without touching other load cases: CIVIL NX keeps every case's beam loads, nodal loads, pressures and temperatures of an element or node in ONE row, so a plain delete… | Changes model | Background when applied |
| `civil_write_tables` | Creates, changes or deletes rows in any CIVIL NX database table through the MIDAS API — nodes, elements, materials, sections, thicknesses, supports, links, load cases, loads, groups, stages… | Changes model | Background when applied |
| `civil_write_tables_undo` | Puts every row a civil_write_tables run touched back as it was before the run: deletes rows it created, restores rows it changed or deleted (a merging table's row is replaced whole). | Changes model | Background when applied |
| `civil_run_analysis` | Runs the CIVIL NX analysis of the open model (doc/ANAL), so results can be read with the result tools straight after building or changing a model. | Changes model | Background when applied |
| `civil_save_model` | Saves the open CIVIL NX model: over its own file (doc/SAVE), or as a new .mcb file when path is given (doc/SAVEAS; a file of that name is overwritten). | Changes model | Background when applied |

## Auto Structure Groups

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `auto_structure_groups` | Creates one structure group per section, per material, or per section + material pair, with the Auto Structure Groups plugin's own engine: it reads every element's section and material, names each… | Changes model | Background when applied |
| `auto_structure_groups_undo` | Reverses an auto_structure_groups run from the ledger: deletes the groups it created and puts every group it added members to back exactly as it was (from the snapshot taken just before the write). | Changes model | Background when applied |

## Beam to Plate

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `b2p_survey` | Reads the model the way the Beam to Plate plugin (1.0.6) does and studies every section the chosen beams use, against CIVIL NX's own published properties (/ope/SECTPROP): whether the outline was READ… | Read-only | Background |
| `b2p_convert` | Converts beam elements into a plate (or solid) mesh of their cross-section with the Beam to Plate plugin's own engine (1.0.6): every section CIVIL NX gives geometry for (rolled/fabricated steel, PSC… | Changes model | Background |
| `b2p_undo` | Undoes a b2p_convert run from the ledger with the plugin's own Undo: removes the virtual beams, the plates/solids, the rigid links and construction-joint links, the converted loads and the nodes it… | Changes model | Background when applied |

## Bridge Reshaper

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `bridge_reshape_read` | Reads the open model the way the Bridge Reshaper plugin (1.0.6) does: the deck (straight, in straight pieces kinked at half-joints or piers, or curved; beam girders, girders meshed as plates, or a… | Read-only | Background |
| `bridge_reshape` | Changes the geometry of the bridge in the open model in place, with the Bridge Reshaper plugin's own engine (1.0.6): new span lengths (the deck is stretched - each span keeps its element count), a… | Changes model | Background |
| `bridge_reshape_undo` | Undoes a bridge_reshape run from the ledger with the plugin's own Undo: every row the run overwrote is written back and every row it created is removed, so the model returns exactly. | Changes model | Background when applied |

## Bridge Thermal Loads

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `bridge_thermal_calc` | Calculates bridge temperature actions with the Bridge Thermal Loads plugin's own engine: shade air and effective bridge temperatures, the uniform ranges ΔT_N,con / ΔT_N,exp (and bearing ranges), the… | Calculation |  |
| `bridge_thermal_read` | Reads the open model the way the Bridge Thermal Loads plugin does: the deck from a structure group, element list or the CIVIL NX selection, grouped into sections (beams by section, plates by… | Read-only | Background |
| `bridge_thermal_apply` | Calculates the temperature actions for the deck and writes them with the Bridge Thermal Loads plugin's writer: EC1T_Uniform_Exp/_Con (type T, element or system temperature), EC1T_Diff_Heat/_Cool… | Changes model | Background |
| `bridge_thermal_undo` | Undoes the latest bridge_thermal_apply or bridge_thermal_remove run (or the run named): deletes the EC1T_ cases present now and puts back the EC1T_ cases and loads saved before that run, merged into… | Changes model | Background when applied |
| `bridge_thermal_remove` | Removes what the Bridge Thermal Loads plugin writes: every load case whose name starts with EC1T_ (also named sets and ones the plugin window wrote) and all temperature loads in them, on any element. | Changes model | Background when applied |

## Concurrent Force Reporter

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `concurrent_forces_setup` | Concurrent Force Reporter, step 1. Reads the open CIVIL NX model the way the plugin does when it connects and lists what a concurrent-forces run can use: every load case and combination (all ten LCOM… | Read-only | Background |
| `concurrent_forces` | Concurrent Force Reporter, step 2. For a set of items (elements, nodes, links), finds the load state that makes ONE key effect extreme at ONE key item (max, min or absolute max over the selected load… | Read-only | Background |
| `concurrent_forces_probe` | Concurrent Force Reporter diagnostics. For each result source the plugin reads (beam, truss, plate, general link, elastic link, node reaction, node displacement), asks this CIVIL NX build with one… | Read-only | Background |

## CS 454 - Moving Load Wizard

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `cs454_lane_layout` | Lays out CS 454 notional lanes, remaining areas, footways and strips on a carriageway cross-section with the CS454 - Moving Load Wizard's own layout engine (Table 5.9a, cl 5.10, ALL model 1… | Calculation |  |
| `cs454_moving_loads_read` | Read-only: changes nothing in the model. Call it before cs454_moving_loads to see what the CS454 - Moving Load Wizard would do. | Read-only | Background |
| `cs454_moving_loads` | CS 454 assessment live loading with the CS454 - Moving Load Wizard plugin's own engine: notional lanes laid out on the carriageway (line lanes on a grillage, surface lanes on a plate deck), ALL model… | Changes model | Background when applied |
| `cs454_moving_loads_undo` | Removes the lanes, vehicles, cases, envelopes and groups a cs454_moving_loads run wrote, using the plugin's own cleanup (cases and envelopes first, bottom up, at most 100 per call): anything edited… | Changes model | Background when applied |

## CS 454 Load Assessment Combinations

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `cs454_combinations_read` | Reads the open model the way the CS 454 Load Assessment Combinations plugin does: every static, construction-stage, settlement and moving load case with the Table A.1 action / CS 454 load model and… | Read-only |  |
| `cs454_combinations_apply` | Generates CS 454 assessment load combinations with the plugin's engine (Table A.1 γfL by combination 1–4 and limit state, adverse/relieving permanent variants, wind sub-case, ALL/SV/HB traffic with… | Changes model | Background |
| `cs454_combinations_undo` | Undoes the latest cs454_combinations_apply run (or the run named) with the plugin's cleanup: deletes the rows it wrote that still carry its names (referencing rows first), then restores every table… | Changes model | Background when applied |

## CS 455 RC + PSC Assessment

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `cs455_describe_section` | Start here when the user shares a reinforcement drawing, photo or schedule. | Read-only |  |
| `cs455_assess` | CS 455 ULS assessment of reinforced concrete beam sections with the plugin's own engine: reads the concurrent force rows (BEAMFORCE / BEAMFORCEVBM for envelopes and moving loads, kN·m; a moving-load… | Read-only | Background |
| `cs455_export_calc_sheet` | The report. Assesses one element end exactly as cs455_assess and writes the plugin's reference-format calculation sheet (.xlsx: A4 pages, title block, geometry, materials, reinforcement, section… | Read-only | Background |

## Construction Stage Reporter

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `cs_stage_summary` | Reads the construction stage definition of the open CIVIL NX model with the Construction Stage Reporter plugin's engine and returns, per stage: duration and day range, the structure groups activated… | Read-only |  |
| `cs_stage_results` | Reads construction-stage analysis results the way the Construction Stage Reporter plugin does (POST /post/TABLE in the construction-stage family, every stage in one query at its last step; stages… | Read-only | Background |
| `cs_stage_report` | Makes the Construction Stage Reporter plugin's own reports of the open model's construction stages and returns download links (never the file inline): the Excel workbook (summary, stage matrices for… | Read-only | Background |

## 2D Culvert

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `culvert_preview` | Validates a 2D Culvert project with the plugin's own Eurocode core and returns what it would build: nodes, elements, soil springs, basic load cases (traffic unit cases), the EN 1990 Annex A2… | Calculation |  |
| `culvert_build` | Writes the 2D Culvert model exactly as the plugin's Build: units, user material, sections, frame, soil springs, supports, every basic load case with its loads, and the nested EN 1990 Annex A2… | Changes model | Background when applied |
| `culvert_build_undo` | Deletes every row a culvert_build wrote (combinations, loads, load cases, springs, supports, groups, elements, nodes, sections, material) from the ledger's record, and puts back the model's units. | Changes model | Background when applied |
| `culvert_analyse_and_check` | On the culvert model built from the same inputs (refused if the open model's counts differ): runs the CIVIL NX analysis (unless analyse: false), reads the basic-case results (forces, reactions… | Changes model | Background |
| `culvert_report` | Runs the checks on the analysed culvert model (as culvert_analyse_and_check, without re-analysing unless analyse: true) and writes the plugin's report: format xlsx (default) = the calculation book in… | Read-only | Background |

## Advanced DXF Importer

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `dxf_inspect` | Reads a DXF with the Advanced DXF Importer plugin's own parser and clean-up and reports what an import would create: the file (version, encoding, entity counts, what is ignored or unsupported), its… | Calculation |  |
| `dxf_import` | Imports a DXF into the open CIVIL NX model with the Advanced DXF Importer plugin's engine: the same parse, layer mapping, clean-up and write as the plugin. | Changes model | Background when applied |
| `dxf_import_undo` | Removes what one dxf_import created, with the plugin's own removal rules: it refuses unless the import's master group is in the open model; deletes the import's elements, then its nodes, only where… | Changes model | Background when applied |

## Eurocode Load Combinations

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `ec_combinations_read` | Reads the open model the way the Eurocode Load Combinations plugin does: every static, moving (characteristic/frequent pairs), construction-stage, settlement and response-spectrum case with the… | Read-only |  |
| `ec_combinations_apply` | Generates EN 1990 bridge load combinations with the Eurocode Load Combinations plugin's engine (6.10 / 6.10a+b, SLS characteristic / frequent / quasi-permanent, accidental 6.11, seismic 6.12; Annex… | Changes model | Background |
| `ec_combinations_undo` | Undoes the latest ec_combinations_apply run (or the run named) with the plugin's undo: deletes the rows it wrote that still carry its names, then restores the rows it deleted at their original keys. | Changes model | Background when applied |

## Eurocode - Moving Load Wizard

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `ec_lane_layout` | Lays out EN 1991-2 lanes on a carriageway cross-section with the Eurocode - Moving Load Wizard's own layout engine: Table 4.1 notional lanes and the remaining area, footways, the LM2 axle lane, the… | Calculation |  |
| `ec_moving_loads_read` | Read-only: changes nothing in the model. Call it before ec_moving_loads to see what the Eurocode - Moving Load Wizard would do. | Read-only | Background |
| `ec_moving_loads` | EN 1991-2 traffic loading with the Eurocode - Moving Load Wizard plugin's own engine: lanes laid out on the carriageway (line lanes on a grillage, surface lanes on a plate deck) for the chosen load… | Changes model | Background when applied |
| `ec_moving_loads_undo` | Removes the lanes, vehicles, cases and groups an ec_moving_loads run wrote, using the plugin's own cleanup (cases first, bottom up, at most 100 per call): anything edited since the run, or still used… | Changes model | Background when applied |

## Eurocode Wind Loads

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `ec_wind_bridge` | Calculates EN 1991-1-4 §8 wind actions on a bridge deck with the Eurocode Wind Loads plugin's own engine: v_b, q_p(z_e), c_sc_d, d_tot, the transverse (x), longitudinal (y) and vertical (z, at e =… | Calculation |  |
| `ec_wind_read_deck` | Reads the open model the way the Eurocode Wind Loads plugin does: finds the deck (or measures the elements / group given), and reports b, d, L, the soffit height, the span axis, whether the deck is… | Read-only |  |
| `ec_wind_apply` | Calculates §8 wind on the deck and writes it with the Eurocode Wind Loads plugin's adapter: one EC1W_ load case per global direction, then beam loads (beam deck) or a pressure + fascia nodal loads… | Changes model | Background when applied |
| `ec_wind_remove` | Removes what the Eurocode Wind Loads plugin writes: every EC1W_ load case, its load group, and their beam/pressure/nodal loads — whether this tool or the plugin window wrote them. | Changes model | Background when applied |

## Skew Grillage Geometry Generator

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `skew_grillage` | Generates a bridge deck (beam grillage or plate mesh) with the Skew Grillage Geometry Generator plugin's own engine: skew, unequal girders, plan curvature, multi-span, crossfall and vertical profile… | Changes model | Background when applied |
| `skew_grillage_undo` | Removes the deck a skew_grillage run wrote (its elements, nodes, new structure groups and any default properties nothing else uses). | Changes model | Background when applied |

## Load Combination Contribution Analyzer

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `combination_tree` | Load Combination Contribution Analyzer, step 1. Without name: lists the model's General-tab load combinations (LCOM-GEN) with type (ADD, ENVELOPE, ABS, SRSS), constituent count, whether it is a… | Read-only | Background |
| `combination_contributions` | Load Combination Contribution Analyzer, step 2. Splits one or more load combinations' results at a set of items into the load cases that produced them: for every item, output point (beam I/J and… | Read-only | Background |

## Model Report

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `model_qc_check` | Runs the Model Report plugin's fourteen quality checks on the open CIVIL NX model: duplicate (coincident) nodes, orphan nodes, zero-length and duplicate elements, elements without material/section… | Read-only | Background |
| `model_report_images` | Lists the CIVIL NX pictures the Model Report can put in this model's report, with their keys: FE model views (iso, plan, front, side), the applied loads of each static load case, the figures saved in… | Read-only | Background |
| `model_report_export` | Builds the Model Report plugin's 'Model report' for the open CIVIL NX model — cover, contents, materials, sections (with drawings), supports and springs, load cases, combinations and loads… | Read-only | Background |

## Model to IFC

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `model_bridge_summary` | Reads the open model's geometry tables and CIVIL NX's computed section properties and reports the bridge the Model to IFC plugin finds in it: girder lines, piers and pylons (station, elements… | Read-only |  |
| `model_to_ifc` | Exports the open CIVIL NX model to IFC with the Model to IFC plugin: real section outlines with voids, smooth tapers, tendons, composite deck slabs, materials, structure groups and stages; in IFC4.3… | Read-only | Background |
| `model_to_dxf` | Draws the open CIVIL NX model as DXF with the Model to IFC plugin's drawing engine: a 2D drawing file (DXF 2000: plan, elevation developed along the deck, hidden-line isometric, section cuts with… | Read-only | Background |

## Node Generator

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `create_nodes` | Creates nodes in the open CIVIL NX model from X, Y, Z coordinates with the Node Generator plugin's own engine: every check the plugin window makes (blank or non-numeric coordinates, bad or duplicate… | Changes model | Background when applied |
| `create_nodes_undo` | Reverses a create_nodes run from the ledger: deletes the nodes it created and moves every node it overwrote back to its earlier coordinates. | Changes model | Background when applied |

## PD 6694-1 Integral Abutment

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `pd6694_route_a` | PD 6694-1 integral abutment earth pressures by the limit-equilibrium route (K*, cl.9.4.3/9.4.4) with the PD 6694-1 Integral Abutment plugin's own engine: thermal movement and design displacement, the… | Calculation |  |
| `pd6694_route_a_write` | Writes the four PD 6694 limit-equilibrium states as plate pressures on one or two abutment wall groups, exactly as the plugin's Write button: same-model guard, the PD6694 EP load cases and groups… | Changes model | Background when applied |
| `pd6694_route_a_remove` | Removes the four PD6694 EP limit-equilibrium load cases with their pressures, load groups and stage activations (the plugin's Remove). | Changes model | Background when applied |
| `pd6694_ssi_plan` | Read-only: changes nothing in the model. Call it before pd6694_ssi_run, with the same inputs, to check that the PD 6694-1 Annex A soil-structure interaction run can go ahead — it uses the plugin's… | Read-only |  |
| `pd6694_ssi_run` | Runs the PD 6694-1 Annex A iteration with the plugin's own runner: Winkler springs on the walls (multi-linear), repeated analyses until the wall displacements settle, then the two design pressure… | Changes model | Background when applied |
| `pd6694_ssi_remove` | Removes everything an SSI run left (design pressure cases, spring groups, analysis cases) and restores the model's own springs from the run's backup (the plugin's Remove SSI). | Changes model | Background when applied |

## Point to Patch Convertor

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `point_to_patch_dispersal` | The Point to Patch Convertor's dispersal for one point load: the code's contact area (or the load-derived one), the spread through surfacing and slab to the mid-plane or neutral axis, the effective… | Calculation |  |
| `point_to_patch_read` | Reads the open model as the Point to Patch Convertor does: whether the deck is plates or a grillage, its levels and groups, the point loads (nodal and beam concentrated) per load case that could be… | Read-only | Background |
| `point_to_patch_apply` | Converts the model's point loads (or a coordinate table) into dispersed patch loads with the Point to Patch Convertor's engine and writes them as PATCH_&lt;case&gt; load cases: plate decks get… | Changes model | Background |
| `point_to_patch_undo` | Undoes the latest point_to_patch_apply run (or the run named) with the plugin's cleanup: every PRES / BMLD row the run touched is put back as it was, the PATCH_ cases it removed are restored and the… | Changes model | Background when applied |

## RC Slab & Shell Assessment

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `slab_capacities_from_bars` | Calculation only: needs no model and changes nothing. Turns a slab's bar arrangement into the capacities the RC Slab & Shell Assessment routes need, with the plugin's own core. | Calculation |  |
| `slab_survey` | Reads the open model's plates (ELEM/NODE), structure groups, static cases and combinations (all LCOM tables) the way the RC Slab & Shell Assessment plugin does: orientation groups by plate normal… | Read-only |  |
| `slab_assess` | Reads plate forces (PLATEFORCEUL, element local axes) for one orientation group and the given load cases, rotates them to the reinforcement direction and assesses every position with the plugin's own… | Read-only | Background |
| `slab_explain_location` | The working behind one element's utilisation: reads that element's plate forces, picks its governing position and case (or the one given) and re-runs it through the plugin's explain_location — every… | Read-only |  |

## Bulk Tabular Result Exporter

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `result_table_catalog` | Lists the CIVIL NX tables the Bulk Tabular Result Exporter plugin can export, with each one's id, MIDAS TABLE_TYPE or /db endpoint, components and the arguments it takes: analysis results (reactions… | Calculation |  |
| `preview_result_table` | Reads one table from the open CIVIL NX model the way the exporter's 'Preview this table' does and returns its first rows (default 20, max 200) with unit-labelled headers, any sub-tables (e.g.… | Read-only |  |
| `export_result_tables` | Exports one or more CIVIL NX tables (each like the preview_result_table arguments, full scope, no sampling) into one Excel workbook built by the exporter plugin: one sheet per table (and per… | Read-only | Background |

## Section Designer

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `section_preview` | Checks a cross-section's outlines with Section Designer's own rules (closed, not self-crossing, holes inside their outline, no overlaps, materials) and returns a PNG drawing of it — the outlines… | Calculation |  |
| `section_properties` | Computes the full CIVIL NX property set of a section with Section Designer's solver: exact area, centroid, second moments, extreme fibres and perimeters from the outlines, and torsion J and shear… | Calculation |  |
| `section_write` | Writes a section into the open CIVIL NX model exactly as Section Designer's Write button does: VALUE/GEN, PSC/VALU or COMPOSITE-GEN with its computed properties (CIVIL keeps them as sent), in the… | Changes model | Background when applied |
| `section_write_undo` | Reverses a section_write run from the ledger: deletes the section it created (refused while elements use it), or writes back the section it replaced, then reads back. | Changes model | Background when applied |
| `section_read` | Without id: lists the model's sections (id, name, type, whether Section Designer can edit it) and the next free id. | Read-only |  |

## Construction Stage Wizard

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `stage_groups` | Creates structure groups with the Construction Stage Wizard plugin's group builder: pick a scope of elements, split it by rules (slice along X/Y/Z into n segments or at cuts, by section, material… | Changes model | Background when applied |
| `construction_stages` | Builds a construction stage sequence with the Construction Stage Wizard plugin's bulk generator and writes it with its stage planner (which keeps composite sections and construction-stage load… | Changes model | Background when applied |
| `stages_undo` | Restores the rows a stage_groups or construction_stages run changed, from the snapshot taken just before it wrote (the plugin's own restore). | Changes model | Background when applied |

## Stress Profile Generator

| Tool | What it does | Effect | Runs |
|---|---|---|---|
| `stress_element_loads` | Reads what the Stress Profile Generator can show for chosen beam elements: each element's section (type, outline verified, composite parts, tapered), material, length, the load cases / combinations /… | Read-only |  |
| `stress_profile` | The Stress Profile Generator's profile for ONE beam element: from CIVIL NX's beam forces and the true section outline it calculates σx (or σx from N / My / Mz, τ from Vz / Vy, von Mises, principal… | Read-only |  |
| `sls_stress_check` | The Stress Profile Generator's SLS report check (EN 1992-2 §7.2 concrete, EN 1993-2 §7.3 structural steel; normal stress σx at the fibres) over many elements × positions × combinations — or, with… | Read-only | Background |
