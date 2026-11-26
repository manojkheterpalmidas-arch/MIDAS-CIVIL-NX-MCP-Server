<p align="center"><img src="icon.png" width="96" alt="MIDAS IT Europe"></p>

# MIDAS CIVIL NX MCP Server

[![M8ven Score](https://m8ven.ai/badge/mcp/manojkheterpalmidas-arch-midas-civil-nx-mcp-server-x3kcgj?v=b2be90e9162462c106e0d5ccb5bee3b6)](https://m8ven.ai/mcp/manojkheterpalmidas-arch-midas-civil-nx-mcp-server-x3kcgj?s=readme)
[![MCP Badge](https://lobehub.com/badge/mcp/manojkheterpalmidas-arch-midas-civil-nx-mcp-server)](https://lobehub.com/mcp/manojkheterpalmidas-arch-midas-civil-nx-mcp-server)

Let Claude, ChatGPT, GitHub Copilot or any MCP client build, check and report on a **MIDAS CIVIL NX** model, using the same engines that run the [MIDAS IT Europe plugins](https://midasiteurope.com/plugins).

Ask your assistant to set up lanes, stages or a grillage, and it:
1. reads your open model,
2. proposes the inputs,
3. shows you a preview,
4. and only after you agree, writes it to CIVIL NX with the same code the plugin runs.

It can also read results (concurrent forces, stress profiles, construction stages, any result table), split a load combination into the load cases that make it up, run assessments (CS 455, Eurocode section checks, RC slabs, culverts, SLS stresses) and export reports, IFC and DXF. It can **design prestressing tendons** for a concrete girder to EN 1992-1-1 with Tendon Designer, or read the tendons already in the model and check them, then write the tendons, their prestress and their construction stages into CIVIL NX. Send it a sketch or photo of a cross-section and it builds the section with Section Designer.

Beyond the plugins, it can **build a model from scratch**: it looks up each table in the MIDAS API manual, writes nodes, elements, materials, sections, supports, loads and combinations through the same preview → approve → apply → undo steps, saves the model and runs the analysis. It also **answers how-to questions from the official MIDAS manuals** (CIVIL NX and GEN NX online help, MIDAS API manual, FAQ) and links the article it used.

The server is hosted by MIDAS IT Europe. **There is nothing to install.** You point your assistant at one address:

```
https://midasiteurope.com/mcp/lazy
```

This is [lazy mode](#lazy-mode-fewer-tokens-in-every-chat): your assistant starts with three small tools and looks up the rest when a task needs them, instead of reading every tool's description (about 80,000 tokens) at the start of every chat. `https://midasiteurope.com/mcp` without `/lazy` lists every tool up front.

It is listed in the official [MCP Registry](https://registry.modelcontextprotocol.io/v0/servers?search=com.midasiteurope) as `com.midasiteurope/civil-nx`.

## Quick start: no account or token needed to connect

The server answers `initialize` and `tools/list` without any token. You can connect, see every tool, run the calculation tools and search the MIDAS manuals straight away. A [personal token](#get-your-personal-token) is only needed for the tools that read or change a CIVIL NX model.

Any client that takes a remote (streamable HTTP) server:

```json
{
  "mcpServers": {
    "civil-nx": {
      "type": "http",
      "url": "https://midasiteurope.com/mcp"
    }
  }
}
```

Clients that only start local (stdio) servers can reach the same address through [`mcp-remote`](https://www.npmjs.com/package/mcp-remote), with no token and nothing else to install:

```json
{
  "mcpServers": {
    "civil-nx": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://midasiteurope.com/mcp"]
    }
  }
}
```

To work on your model, add your token as a header, `Authorization: Bearer cnx_…`, or use your connector URL instead of the plain address. There is no package to install and no script in this repository to run: the code in [`desktop/`](desktop) is only the Claude Desktop extension, which Claude Desktop runs from the `.mcpb` file.

## Capabilities

93 tools: the engines of 28 plugins, plus model-level tools. See [TOOLS.md](TOOLS.md) for the full list, or [midasiteurope.com/llm](https://midasiteurope.com/llm#tools) for every input. How the calculations have been checked against published worked examples and code equations, and what has not been checked yet, is in [VERIFICATION.md](VERIFICATION.md).

> **About the tool count.** The server lists **93 tools** (`tools/list` on `/mcp`). Some directories still show **108**: they captured the list before server 0.8.0, which replaced the 17 per-plugin undo tools with one `undo_run` and folded `model_qc_check` into `model_health_check`. Those 18 older names are no longer listed, but they still run when called by name, so existing prompts keep working. 93 listed + 18 hidden = 111 callable names. The listed count is the one to quote.

| Area | Plugins and tools |
|---|---|
| Model and documentation | Model status and any table read; **write any model table** (with undo); run the analysis; save the model; **search and read the MIDAS manuals**; **MIDAS library**: material standards, section shapes, load case types, moving-load codes and standard vehicles, boundary, tendon, temperature and dynamic options (from [midas-civil-python](https://github.com/MIDASIT-Co-Ltd/midas-civil-python)) |
| Geometry and model set-up | Skew Grillage Geometry Generator, Bridge Reshaper, Node Generator, Section Designer, Beam to Plate, Point to Patch Convertor, Advanced DXF Importer, Auto Structure Groups |
| Loads and combinations | CS 454 and Eurocode Moving Load Wizards, CS 454 and Eurocode Load Combinations, Wind Load Calculator (with its Excel hand calculation, EN 1991-1-4 or CS 454), Bridge Thermal Loads |
| Prestressing | **Tendon Designer**: post- and pre-tensioned tendons to EN 1992-1-1 (new layouts, or the model's own tendons read in and checked), composite girders stage by stage, standard precast beam strand patterns with debonding, external tendons, written to the model with their prestress and stages |
| Construction stages | Construction Stage Wizard, Construction Stage Reporter |
| Model checking | **Model health check**: about 45 checks of the model data (mesh and beam quality, properties, links, supports, loads, stages, combinations, groups, tendons) and, on an analysed model, reactions against the applied loads, self weight against element volumes, and displacements — red/amber/green by area |
| Results and reporting | Concurrent Force Reporter, Load Combination Contribution Analyzer, Stress Profile Generator, Bulk Tabular Result Exporter, Model Report, Model to IFC |
| Design and assessment | CS 455 RC + PSC Assessment, Eurocode Section Checker, RC Slab & Shell Assessment, 2D Culvert, PD 6694-1 Integral Abutment |

## Requirements

- **MIDAS CIVIL NX**, with the model open and its MAPI key (CIVIL NX: *Apps > API Settings*).
- **A free MIDAS IT Europe account** at [midasiteurope.com](https://midasiteurope.com/sign-up?next=%2Fllm), only for the tools that read or change a model. Connecting, listing the tools, the calculation tools and the manual search work without an account or token.
- **An MCP client:** claude.ai or Claude Desktop, Claude Code, VS Code with GitHub Copilot, Microsoft Copilot Studio, ChatGPT, or any client that supports remote (streamable HTTP) MCP servers.

## Get your personal token

1. Sign in at **[midasiteurope.com/llm](https://midasiteurope.com/llm#connect)**.
2. Paste the MAPI key from CIVIL NX. It is checked with MIDAS and stored encrypted.
3. You get two things. Copy them straight away, because they are shown only once:
   - a **connector URL** (`https://midasiteurope.com/mcp/c/<your token>/lazy`), for clients that connect by URL;
   - a **personal token** (`cnx_…`), for clients that send a header.

You give your assistant the URL or the token, never your MAPI key. A token can be made **read-only**: the assistant can then read and preview, but every apply is refused.

Tokens don't expire. If your MAPI key changes, use *Change key* on the same page: the token stays the same. You can revoke a token there at any time.

## Connect your AI client

### Claude Desktop: one-click extension

1. Download **[midas-civil-nx.mcpb](https://github.com/manojkheterpalmidas-arch/MIDAS-CIVIL-NX-MCP-Server/releases/latest/download/midas-civil-nx.mcpb)**.
2. Double-click it, or drag it into Claude Desktop (*Settings > Extensions*). Then select **Install**.
3. Paste your **personal token** when asked. Claude Desktop keeps it in your system's secure store.

The extension is a small bridge that forwards Claude's requests to `https://midasiteurope.com/mcp/lazy`, where the tools run (lazy mode since extension 1.0.1). Its source is in [`desktop/`](desktop). It works on any Claude plan that has Claude Desktop, with no custom-connector setting needed.

### claude.ai (web), or Claude Desktop by URL

*Settings > Connectors > Add custom connector*, then paste your **connector URL**. Custom connectors depend on your Claude plan.

### Claude Code

```bash
claude mcp add --transport http civil-nx https://midasiteurope.com/mcp --header "Authorization: Bearer <your personal token>"
```

Claude Code already looks tools up only when it needs them, so it uses the full address without `/lazy`.

### Visual Studio Code / GitHub Copilot

Run **MCP: Add Server** from the Command Palette, choose **HTTP** and paste your connector URL.

Or copy [`.vscode/mcp.json`](.vscode/mcp.json) from this repository into your project. VS Code asks for the token once and stores it securely, so it never sits in the file:

```json
{
  "inputs": [
    { "type": "promptString", "id": "civil-nx-token", "description": "MIDAS IT Europe personal token", "password": true }
  ],
  "servers": {
    "civilNx": {
      "type": "http",
      "url": "https://midasiteurope.com/mcp/lazy",
      "headers": { "Authorization": "Bearer ${input:civil-nx-token}" }
    }
  }
}
```

Then open Copilot Chat in **Agent** mode, check that the CIVIL NX tools are ticked in the tools list, and ask it to work on your open model.

### Microsoft Copilot Studio (agents for Microsoft 365 Copilot and Teams)

1. Open your agent and go to **Tools > Add a tool > New tool > Model Context Protocol**.
2. Set Server name to *CIVIL NX tools*, give a description such as *Reads, checks and builds the user's open MIDAS CIVIL NX model*, and set Server URL to `https://midasiteurope.com/mcp/lazy`.
3. Set Authentication to **API key**, type **Header**, header name `X-MAPI-Key`. Select **Create**.
4. Under **Create a new connection**, paste your personal token (the `cnx_…` value on its own, without `Bearer`). Then select **Add to agent**.

Each person using the agent connects with their own token, because it works on their own open model.

### ChatGPT (custom GPT actions) and other agents

Import [`https://midasiteurope.com/openapi.json`](https://midasiteurope.com/openapi.json) as the action schema. Choose API key authentication, Bearer, with your personal token.

Any HTTP client can call `POST https://midasiteurope.com/api/v1/tools/<tool>` with `Authorization: Bearer <token>`. Long calls return a `jobId` to poll at `/api/v1/jobs/<jobId>`.

### Lazy mode: fewer tokens in every chat

Most assistants read every tool's description at the start of every conversation: roughly 80,000 tokens for all the tools. So the addresses above, the connector URL from midasiteurope.com/llm and [`.vscode/mcp.json`](.vscode/mcp.json) all end in `/lazy`, and the assistant sees three small tools instead:

```
https://midasiteurope.com/mcp/lazy
https://midasiteurope.com/mcp/c/<your token>/lazy
```

- `find_tools` looks up the tools a task needs, with their full descriptions and inputs.
- `run_tool` runs one of them.
- `job_status` follows background jobs.

The tools behind them, their previews, go-aheads and undo are exactly the same. Keep it in claude.ai, ChatGPT, Copilot and other assistants that load every tool up front. Claude Code already looks tools up only when it needs them, so it uses the full address `https://midasiteurope.com/mcp`; any address without `/lazy` lists every tool, and connections made before lazy became the default keep working as they are. The trade-off: one extra lookup for each new kind of task, and your assistant asks permission for `run_tool` as a whole rather than tool by tool.

### Task profiles: only the tools for one kind of work

A profile address lists a fixed, smaller set of tools, under a third of the full list, each with its full description. The server refuses any other tool on that connection:

```
https://midasiteurope.com/mcp/p/<profile>
https://midasiteurope.com/mcp/c/<your token>/p/<profile>
```

| Profile | For |
|---|---|
| `build` | Grillages, nodes, sections, structure groups and stages, Beam to Plate, DXF import, culverts, reshaping a bridge, model table writes |
| `loads` | Supports and loads, wind, thermal, wheel-load dispersal, PD 6694 integral abutments, load combinations |
| `traffic` | EN 1991-2 and CS 454 lanes and moving loads, with their combinations |
| `prestress` | Tendon Designer, stress profiles, SLS stress checks |
| `checks` | Model health, EN 1992 and CS 455 section checks, RC slabs, culverts, combination contributions, concurrent forces |
| `reports` | Result tables, model and construction-stage reports, IFC and DXF exports |

Every profile also has `civil_status`, `civil_read_table`, `job_status`, `undo_run` and the MIDAS manual search. Use a profile when a chat is about one kind of work and you want the assistant to see, and ask permission for, only those tools.

## How it works

1. **Read.** The assistant calls `civil_status` and the read tools to see your model.
2. **Preview.** A write tool called without `apply` changes nothing. It returns what it would write, plus a `planHash`.
3. **Apply.** After you agree, the assistant calls it again with `apply: true` and that `planHash`. If your model changed in between, nothing is written. Writes run in the background and the assistant follows them with `job_status`.
4. **Undo.** Every write is recorded. `undo_run` lists the recorded writes and reverses one with that plugin's own undo, even in a later conversation.

Try asking:

> *Check what's in my open CIVIL NX model, then set up CS 454 lanes and moving loads for it. Show me the preview before you write anything.*

> *Which load cases make up the worst hogging moment in ULS envelope along the main girder? Give me the breakdown at the critical section.*

> *Build me a two-span continuous concrete beam, 20 m + 20 m, 1.2 m × 0.6 m, pinned supports, self weight plus a 10 kN/m UDL. Show me the preview, then analyse it and give me the support reactions.*

> *Design the post-tensioning for the girder in group "Deck" to EN 1992-1-1. Go through any failed checks with me, then show me the preview before you write the tendons.*

> *Here's a sketch of the deck section. Build it with Section Designer and show me the drawing to check before writing it.*

> *Spread the wheel loads in my model through the fill onto the arch barrel in group "ARCH". Work out the fill depth from the model, tell me how much of each load falls beyond the edge of the arch, then show me the preview before you write the patch loads.*

## Safety, privacy and engineering responsibility

- **Nothing is written without a preview.** A second call must name the previewed plan. One change runs on a model at a time, and the same apply sent twice is carried out once.
- **Options that change or delete existing model data are marked DESTRUCTIVE** in the tool's inputs. The assistant is told to use them only after you agree to what the preview says.
- **Every apply can be undone.** Ask for `undo_run`, and undo later work before the model it sits on.
- **Your MAPI key is never logged or returned.** It is stored only in encrypted form inside your personal token until you revoke it, or until the expiry you can choose when you make the token. See the [privacy notice](https://midasiteurope.com/privacy).
- **You remain the engineer.** The tools run the same checks as the plugins, but an AI assistant can misread a request. Check the preview, check the model, and verify results before relying on them. The outputs do not replace professional engineering judgement. [VERIFICATION.md](VERIFICATION.md) says which calculations have been checked independently and which have not.

[`SECURITY.md`](SECURITY.md) covers the details: how a call travels, how keys and tokens are kept, what the server enforces, prompt injection, retention, and how to report a vulnerability.

## About this repository

This repository holds documentation and client configuration only. The server runs at `midasiteurope.com`; its source is not published.

| File | What it is |
|---|---|
| [`TOOLS.md`](TOOLS.md) | The tool list, generated from the live catalogue |
| [`SECURITY.md`](SECURITY.md) | Security model, data handling and vulnerability reporting |
| [`VERIFICATION.md`](VERIFICATION.md) | The calculation tools checked against published worked examples and code equations, with the not-yet-verified list |
| [`verification/verify.test.mjs`](verification/verify.test.mjs) | Those checks as a test you can run against the hosted server: `node --test verification/verify.test.mjs` |
| [`.vscode/mcp.json`](.vscode/mcp.json) | Ready-made VS Code / GitHub Copilot configuration |
| [`desktop/`](desktop) | The Claude Desktop extension: manifest and the bridge to the hosted server (no tool code). Packed with `npx @anthropic-ai/mcpb pack desktop` and attached to each release |
| [`server.json`](server.json) | The server's MCP Registry entry |
| [`scripts/make-tools-md.mjs`](scripts/make-tools-md.mjs) | Regenerates `TOOLS.md` |

## Related: scripting CIVIL NX in Python

For repeatable scripts outside a chat, MIDAS IT's open-source **[midas-civil-python](https://github.com/MIDASIT-Co-Ltd/midas-civil-python)** library (`pip install midas-civil`, MIT) builds models, runs analyses and extracts results from Python. It talks to the same MIDAS API as this server. The server's `midas_library` tool uses its material standards, code options and examples as reference data.

## Support

- Setup and account: [midasiteurope.com/llm](https://midasiteurope.com/llm)
- Plugins: [midasiteurope.com/plugins](https://midasiteurope.com/plugins)
- Contact: [eusupport@midasit.com](mailto:eusupport@midasit.com)

MIDAS IT EUROPE · [midasiteurope.com](https://midasiteurope.com). MIDAS and CIVIL NX are products of MIDAS IT Co., Ltd. See [LICENSE.md](LICENSE.md).
