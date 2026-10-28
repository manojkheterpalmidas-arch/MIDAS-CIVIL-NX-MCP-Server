<p align="center"><img src="icon.png" width="96" alt="MIDAS IT Europe"></p>

# MIDAS CIVIL NX MCP Server

Let Claude, ChatGPT, GitHub Copilot or any MCP client build, check and report on a **MIDAS CIVIL NX** model, using the same engines that run the [MIDAS IT Europe plugins](https://midasiteurope.com/plugins).

Ask your assistant to set up lanes, stages or a grillage, and it:
1. reads your open model,
2. proposes the inputs,
3. shows you a preview,
4. and only after you agree, writes it to CIVIL NX with the same code the plugin runs.

It can also read results (concurrent forces, stress profiles, construction stages, any result table), split a load combination into the load cases that make it up, run assessments (CS 455, RC slabs, culverts, SLS stresses) and export reports, IFC and DXF. Send it a sketch or photo of a cross-section and it builds the section with Section Designer.

Beyond the plugins, it can **build a model from scratch**: it looks up each table in the MIDAS API manual, writes nodes, elements, materials, sections, supports, loads and combinations through the same preview → approve → apply → undo steps, saves the model and runs the analysis. It also **answers how-to questions from the official MIDAS manuals** (CIVIL NX and GEN NX online help, MIDAS API manual, FAQ) and links the article it used.

The server is hosted by MIDAS IT Europe. **There is nothing to install.** You point your assistant at one address:

```
https://midasiteurope.com/mcp
```

It is listed in the official [MCP Registry](https://registry.modelcontextprotocol.io/v0/servers?search=com.midasiteurope) as `com.midasiteurope/civil-nx`.

## Capabilities

97 tools: the engines of 26 plugins, plus model-level tools. See [TOOLS.md](TOOLS.md) for the full list, or [midasiteurope.com/llm](https://midasiteurope.com/llm#tools) for every input.

| Area | Plugins and tools |
|---|---|
| Model and documentation | Model status and any table read; **write any model table** (with undo); run the analysis; save the model; **search and read the MIDAS manuals** |
| Geometry and model set-up | Skew Grillage Geometry Generator, Bridge Reshaper, Node Generator, Section Designer, Beam to Plate, Point to Patch Convertor, Advanced DXF Importer, Auto Structure Groups |
| Loads and combinations | CS 454 and Eurocode Moving Load Wizards, CS 454 and Eurocode Load Combinations, Eurocode Wind Loads, Bridge Thermal Loads |
| Construction stages | Construction Stage Wizard, Construction Stage Reporter |
| Results and reporting | Concurrent Force Reporter, Load Combination Contribution Analyzer, Stress Profile Generator, Bulk Tabular Result Exporter, Model Report, Model to IFC |
| Design and assessment | CS 455 RC + PSC Assessment, RC Slab & Shell Assessment, 2D Culvert, PD 6694-1 Integral Abutment |

## Requirements

- **MIDAS CIVIL NX**, with the model open and its MAPI key (CIVIL NX: *Apps > API Settings*).
- **A free MIDAS IT Europe account** at [midasiteurope.com](https://midasiteurope.com/sign-up?next=%2Fllm). You need it for any tool that reads or changes a model. The calculation tools work without one.
- **An MCP client:** claude.ai or Claude Desktop, Claude Code, VS Code with GitHub Copilot, Microsoft Copilot Studio, ChatGPT, or any client that supports remote (streamable HTTP) MCP servers.

## Get your personal token

1. Sign in at **[midasiteurope.com/llm](https://midasiteurope.com/llm#connect)**.
2. Paste the MAPI key from CIVIL NX. It is checked with MIDAS and stored encrypted.
3. You get two things. Copy them straight away, because they are shown only once:
   - a **connector URL**, for clients that connect by URL;
   - a **personal token** (`cnx_…`), for clients that send a header.

You give your assistant the URL or the token, never your MAPI key. A token can be made **read-only**: the assistant can then read and preview, but every apply is refused.

Tokens don't expire. If your MAPI key changes, use *Change key* on the same page: the token stays the same. You can revoke a token there at any time.

## Connect your AI client

### claude.ai and Claude Desktop

*Settings > Connectors > Add custom connector*, then paste your **connector URL**. Custom connectors depend on your Claude plan.

### Claude Code

```bash
claude mcp add --transport http civil-nx https://midasiteurope.com/mcp --header "Authorization: Bearer <your personal token>"
```

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
      "url": "https://midasiteurope.com/mcp",
      "headers": { "Authorization": "Bearer ${input:civil-nx-token}" }
    }
  }
}
```

Then open Copilot Chat in **Agent** mode, check that the CIVIL NX tools are ticked in the tools list, and ask it to work on your open model.

### Microsoft Copilot Studio (agents for Microsoft 365 Copilot and Teams)

1. Open your agent and go to **Tools > Add a tool > New tool > Model Context Protocol**.
2. Set Server name to *CIVIL NX tools*, give a description such as *Reads, checks and builds the user's open MIDAS CIVIL NX model*, and set Server URL to `https://midasiteurope.com/mcp`.
3. Set Authentication to **API key**, type **Header**, header name `X-MAPI-Key`. Select **Create**.
4. Under **Create a new connection**, paste your personal token (the `cnx_…` value on its own, without `Bearer`). Then select **Add to agent**.

Each person using the agent connects with their own token, because it works on their own open model.

### ChatGPT (custom GPT actions) and other agents

Import [`https://midasiteurope.com/openapi.json`](https://midasiteurope.com/openapi.json) as the action schema. Choose API key authentication, Bearer, with your personal token.

Any HTTP client can call `POST https://midasiteurope.com/api/v1/tools/<tool>` with `Authorization: Bearer <token>`. Long calls return a `jobId` to poll at `/api/v1/jobs/<jobId>`.

## How it works

1. **Read.** The assistant calls `civil_status` and the read tools to see your model.
2. **Preview.** A write tool called without `apply` changes nothing. It returns what it would write, plus a `planHash`.
3. **Apply.** After you agree, the assistant calls it again with `apply: true` and that `planHash`. If your model changed in between, nothing is written. Writes run in the background and the assistant follows them with `job_status`.
4. **Undo.** Every write is recorded. The matching `…_undo` tool reverses it, even in a later conversation.

Try asking:

> *Check what's in my open CIVIL NX model, then set up CS 454 lanes and moving loads for it. Show me the preview before you write anything.*

> *Which load cases make up the worst hogging moment in ULS envelope along the main girder? Give me the breakdown at the critical section.*

> *Build me a two-span continuous concrete beam, 20 m + 20 m, 1.2 m × 0.6 m, pinned supports, self weight plus a 10 kN/m UDL. Show me the preview, then analyse it and give me the support reactions.*

> *Here's a sketch of the deck section. Build it with Section Designer and show me the drawing to check before writing it.*

## Safety, privacy and engineering responsibility

- **Nothing is written without a preview.** A second call must name the previewed plan. One change runs on a model at a time, and the same apply sent twice is carried out once.
- **Options that change or delete existing model data are marked DESTRUCTIVE** in the tool's inputs. The assistant is told to use them only after you agree to what the preview says.
- **Every apply can be undone.** Use the matching `…_undo` tool, and undo later work before the model it sits on.
- **Your MAPI key is never logged or returned.** It is stored only in encrypted form inside your personal token until you revoke it. See the [privacy notice](https://midasiteurope.com/privacy).
- **You remain the engineer.** The tools run the same checks as the plugins, but an AI assistant can misread a request. Check the preview, check the model, and verify results before relying on them. The outputs do not replace professional engineering judgement.

## About this repository

This repository holds documentation and client configuration only. The server runs at `midasiteurope.com`; its source is not published.

| File | What it is |
|---|---|
| [`TOOLS.md`](TOOLS.md) | The tool list, generated from the live catalogue |
| [`.vscode/mcp.json`](.vscode/mcp.json) | Ready-made VS Code / GitHub Copilot configuration |
| [`server.json`](server.json) | The server's MCP Registry entry |
| [`scripts/make-tools-md.mjs`](scripts/make-tools-md.mjs) | Regenerates `TOOLS.md` |

## Support

- Setup and account: [midasiteurope.com/llm](https://midasiteurope.com/llm)
- Plugins: [midasiteurope.com/plugins](https://midasiteurope.com/plugins)
- Contact: [eusupport@midasit.com](mailto:eusupport@midasit.com)

MIDAS IT EUROPE · [midasiteurope.com](https://midasiteurope.com). MIDAS and CIVIL NX are products of MIDAS IT Co., Ltd. See [LICENSE.md](LICENSE.md).
